// =====================================================================
// "Our song": an original, festive Carnatic-style instrumental in raga
// Hamsadhwani (S R2 G3 P N3: the raga of "Vatapi Ganapatim", a wedding
// favourite), synthesised live with Web Audio. No samples, no copyright.
//
//   VEENA lead (Karplus-Strong plucked string + body resonance, with gamakas:
//   slides into notes and kampita oscillation on held notes) · tala strings
//   strummed on the beat · TABLA in teentaal (bayan boom + tuned dayan + taps)
//   with fills and a closing tihai · manjira ticks · quiet tanpura drone
//
// API:  const m = createMelody();  m.start();  m.stop();  m.isPlaying;  m.setVolume(0.35);  m.destroy();
// createTrack(src) gives the same API for a real MP3 (used when `music` is set in config).
// =====================================================================

const BPM = 104;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const SA = 293.66; // D4 is Sa
const SWARA = { S: 0, R: 2, G: 4, P: 7, N: 11 }; // Hamsadhwani

// Veena melody, one string per bar: "note:beats". ".N" is the lower octave, "S'" the upper one.
// "~" = slide into the note (meend), "*" = kampita (oscillation) on a held note, "-" = rest.
// 20 bars = five teentaal cycles:
//   hook (1-2) → answer (3-4) → hook (5-6) → answer up high (7-8) → fast sangati runs (9-12)
//   → sustained high phrases (13-16) → hook (17-18) → cadence with a 3-fold tihai landing on Sa' at sam.
const HOOK = ["S':1 N:.5 P:.5 ~G:1 P:.5 N:.5", "*S':2 ~N:.5 P:.5 G:.5 R:.5"];
const LEAD = [
  ...HOOK,
  'G:.5 P:.5 G:.5 R:.5 ~S:1 R:.5 G:.5',
  '*P:2 G:.5 P:.5 N:.5 P:.5',
  ...HOOK,
  "G:.5 P:.5 N:.5 S':.5 ~R':1 S':.5 N:.5",
  '~P:1 G:.5 R:.5 *S:2',
  "S:.25 R:.25 G:.25 P:.25 G:.25 P:.25 N:.25 S':.25 N:.25 S':.25 R':.25 G':.25 ~S':1",
  'N:.5 P:.5 G:.5 P:.5 *N:2',
  "P:.25 N:.25 S':.25 R':.25 S':.25 N:.25 P:.25 G:.25 R:.25 G:.25 P:.25 N:.25 ~S':1",
  "R':.5 S':.5 N:.5 P:.5 *G:2",
  "~P:1 N:1 *S':2",
  "~R':1 S':.5 N:.5 *P:2",
  "G:1 ~P:.5 N:.5 *S':2",
  "R':.5 G':.5 R':.5 S':.5 N:.5 P:.5 G:.5 R:.5",
  ...HOOK,
  'G:.5 R:.5 G:.5 P:.5 ~G:1 P:.5 N:.5',
  "S':1 P:.5 N:.5 S':1 P:.5 N:.5", // tihai: (P N S') ×3, the third S' lands on the next loop's sam
];
const BEATS = LEAD.length * 4; // 80 beats ≈ 46 s
const LOOP = BEATS * BEAT;

// Teentaal theka (16 beats); the third vibhag is khali (no bayan).
const THEKA = ['dha', 'dhin', 'dhin', 'dha', 'dha', 'dhin', 'dhin', 'dha', 'dha', 'tin', 'tin', 'ta', 'ta', 'dhin', 'dhin', 'dha'];

/** [beat, bol, velocity] for the whole loop: theka + ghost taps, fills every second cycle, tihai at the end. */
function tablaScore() {
  const ev = [];
  const cycles = BEATS / 16;
  for (let c = 0; c < cycles; c += 1) {
    const b0 = c * 16;
    const last = c === cycles - 1;
    for (let k = 0; k < 16; k += 1) {
      const b = b0 + k;
      if (last && k >= 9.5) break;
      if ((c === 1 || c === 3) && k >= 14) continue; // fill below
      ev.push([b, THEKA[k], k === 0 ? 1 : k % 4 === 0 ? 0.85 : 0.7]);
      if ((k % 4 === 3 || k === 1 || k === 9) && !(last && k === 9)) ev.push([b + 0.5, 'te', 0.35]); // lilt between strokes
    }
    if (c === 1 || c === 3) { // "tirakita" fill into the next cycle
      [[14, 'te', 0.6], [14.25, 'te', 0.5], [14.5, 'ke', 0.6], [14.75, 'te', 0.5], [15, 'dha', 0.9], [15.5, 'te', 0.5], [15.75, 'te', 0.55]]
        .forEach(([k, bol, v]) => ev.push([b0 + k, bol, v]));
    }
    if (last) { // tihai: (dha te te dha) ×3 with gaps; the third dha is the next loop's sam
      const start = b0 + 9.5;
      ['dha', 'te', 'te', 'dha', null, 'dha', 'te', 'te', 'dha', null, 'dha', 'te', 'te']
        .forEach((bol, i) => { if (bol) ev.push([start + i * 0.5, bol, bol === 'dha' ? 0.95 : 0.6]); });
    }
  }
  return ev;
}

// Tanpura cycle, one string every 2 beats: Pa, Sa', Sa', low Sa
const TANPURA = [-17, -12, -12, -24];

function parseNote(tok) {
  let n = tok;
  const glide = n.includes('~'); const kampita = n.includes('*');
  n = n.replace(/[~*]/g, '');
  if (n === '-') return { rest: true };
  let oct = 0;
  if (n.startsWith('.')) { oct = -12; n = n.slice(1); }
  if (n.endsWith("'")) { oct = 12; n = n.slice(0, -1); }
  return { semi: SWARA[n] + oct, glide, kampita };
}
const hz = (semi) => SA * 2 ** (semi / 12);

const SCORE = LEAD.flatMap((bar, b) => {
  let beat = 0;
  return bar.split(' ').map((item) => {
    const [tok, len] = item.split(':');
    const note = { ...parseNote(tok), beat: b * 4 + beat, beats: Number(len) };
    beat += Number(len);
    return note;
  });
});

function makeImpulse(ctx, seconds = 2.2, decay = 3) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c += 1) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
}

function makeNoise(ctx) {
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Karplus-Strong plucked string at `f`; returns { buffer, tune } where tune corrects the loop's fractional delay. */
function makeString(ctx, f, seconds = 3, decay = 0.9986) {
  const sr = ctx.sampleRate;
  const N = Math.max(2, Math.round(sr / f - 0.5));
  const len = Math.floor(sr * seconds);
  const d = new Float32Array(len);
  let lp = 0;
  for (let i = 0; i < N; i += 1) { lp += 0.55 * ((Math.random() * 2 - 1) - lp); d[i] = lp; } // slightly mellow pluck
  // pluck near the bridge: comb the excitation for the veena's bright, nasal attack
  const pos = Math.max(1, Math.round(N * 0.13));
  for (let i = N - 1; i >= pos; i -= 1) d[i] -= 0.6 * d[i - pos];
  for (let i = N; i < len; i += 1) d[i] = decay * 0.5 * (d[i - N] + d[i - N - 1 < 0 ? 0 : i - N - 1]);
  let peak = 0;
  for (let i = 0; i < len; i += 1) peak = Math.max(peak, Math.abs(d[i]));
  const fade = Math.floor(sr * 0.05);
  for (let i = 0; i < len; i += 1) { d[i] /= peak || 1; if (i > len - fade) d[i] *= (len - i) / fade; }
  const buffer = ctx.createBuffer(1, len, sr);
  buffer.getChannelData(0).set(d);
  return { buffer, tune: f / (sr / (N + 0.5)) };
}

/** Builds the audio graph on `ctx` and returns a scheduler for one loop starting at time t0. */
export function buildGraph(ctx, out) {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.006; comp.release.value = 0.25;
  comp.connect(out);
  const dry = ctx.createGain(); dry.gain.value = 0.9; dry.connect(comp);
  const verb = ctx.createConvolver(); verb.buffer = makeImpulse(ctx);
  const wet = ctx.createGain(); wet.gain.value = 0.22;
  verb.connect(wet); wet.connect(comp);
  const bus = ctx.createGain(); bus.connect(dry); bus.connect(verb);
  const drums = ctx.createGain(); drums.gain.value = 0.85; drums.connect(dry);
  const drumVerb = ctx.createGain(); drumVerb.gain.value = 0.25; drums.connect(drumVerb); drumVerb.connect(verb);
  const noise = makeNoise(ctx);

  // Veena body: two resonances + gentle saturation for the jivari buzz
  const body1 = ctx.createBiquadFilter(); body1.type = 'peaking'; body1.frequency.value = 230; body1.Q.value = 1.2; body1.gain.value = 4;
  const body2 = ctx.createBiquadFilter(); body2.type = 'peaking'; body2.frequency.value = 1400; body2.Q.value = 1; body2.gain.value = 3;
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i += 1) { const x = (i / 511.5) - 1; curve[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); }
  shaper.curve = curve;
  const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 4800; tone.Q.value = 0.3;
  const veenaOut = ctx.createGain(); veenaOut.gain.value = 0.9;
  body1.connect(body2); body2.connect(shaper); shaper.connect(tone); tone.connect(veenaOut); veenaOut.connect(bus);

  const str = makeString(ctx, SA);
  const sources = new Set();
  const play = (node, t0, t1) => {
    node.start(t0); node.stop(t1);
    sources.add(node);
    node.onended = () => sources.delete(node);
  };

  /** One veena pluck; prevSemi enables a slide, `kampita` oscillates the held note. */
  function pluck(t, semi, dur, { vel = 1, prevSemi = null, glide = false, kampita = false, dest = body1, gain = 0.42 } = {}) {
    const rate = 2 ** (semi / 12) * str.tune;
    const src = ctx.createBufferSource(); src.buffer = str.buffer;
    const r = src.playbackRate;
    if (glide && prevSemi != null) {
      r.setValueAtTime(2 ** (prevSemi / 12) * str.tune, t);
      r.exponentialRampToValueAtTime(rate, t + Math.min(0.12, dur * 0.4));
    } else {
      r.setValueAtTime(rate * 0.985, t); // tiny settle into pitch, like a fretted string
      r.exponentialRampToValueAtTime(rate, t + 0.03);
    }
    if (kampita && dur > 0.5) { // oscillate up towards the next swara and back, ~6 per second
      const up = rate * 2 ** (1.4 / 12);
      const half = 1 / 12;
      for (let k = t + dur * 0.3; k + 2 * half < t + dur - 0.05; k += 2 * half) {
        r.setValueAtTime(rate, k);
        r.linearRampToValueAtTime(up, k + half);
        r.linearRampToValueAtTime(rate, k + 2 * half);
      }
    }
    const g = ctx.createGain();
    const end = t + dur;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain * vel, t + 0.003);
    g.gain.setValueAtTime(gain * vel, end);
    g.gain.linearRampToValueAtTime(0, end + 0.07);
    src.connect(g); g.connect(dest);
    play(src, t, end + 0.08);
  }

  function veenaLead(t0) {
    let prev = null;
    SCORE.forEach((n) => {
      if (n.rest) { prev = null; return; }
      const vel = n.beat % 1 === 0 ? (n.beat % 4 === 0 ? 1 : 0.9) : 0.78;
      pluck(t0 + n.beat * BEAT, n.semi, n.beats * BEAT, { vel, prevSemi: prev, glide: n.glide, kampita: n.kampita });
      prev = n.semi;
    });
  }

  /** The veena's side tala strings (Sa-Pa-Sa'), brushed softly on beats 1 and 3. */
  function talaStrings(t0) {
    for (let b = 0; b < BEATS; b += 2) {
      [-12, -5, 0].forEach((s, i) => pluck(t0 + b * BEAT + i * 0.012, s, BEAT * 1.6, { gain: 0.07, vel: b % 4 === 0 ? 1 : 0.75 }));
    }
  }

  function tanpura(t, semi) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.018, t + 0.015);
    g.gain.setTargetAtTime(0, t + 0.06, 1.2);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(3000, t);
    f.frequency.exponentialRampToValueAtTime(600, t + 2.6);
    f.connect(g); g.connect(bus);
    [-3, 4].forEach((cents) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.value = hz(semi); o.detune.value = cents;
      o.connect(f); play(o, t, t + 5);
    });
  }

  // ---- tabla
  function bayan(t, vel, meend = false) {
    const o = ctx.createOscillator(); o.type = 'sine';
    if (meend) { o.frequency.setValueAtTime(72, t); o.frequency.exponentialRampToValueAtTime(104, t + 0.28); } // "ghe" rising boom
    else { o.frequency.setValueAtTime(108, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.32); }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.34 * vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g); g.connect(drums);
    play(o, t, t + 0.6);
  }
  function dayan(t, vel, open) {
    // tuned ringing stroke at Sa (an octave up): partials 1-4 for "na", darker and shorter for "tin"
    const f0 = SA * 2;
    const parts = open ? [[1, 1, 0.5], [2, 0.45, 0.3], [3, 0.3, 0.2], [4, 0.16, 0.12]] : [[1, 1, 0.32], [2, 0.25, 0.15]];
    parts.forEach(([m, a, dec]) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f0 * m;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.13 * vel * a, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g); g.connect(drums);
      play(o, t, t + dec + 0.02);
    });
    tap(t, vel * 0.5, 3200);
  }
  function tap(t, vel, freq = 2600) { // "te/ta" — a short, damped finger tap
    const src = ctx.createBufferSource(); src.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12 * vel, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(bp); bp.connect(g); g.connect(drums);
    play(src, t, t + 0.06);
  }
  function ke(t, vel) { // closed bayan slap
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22 * vel, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.connect(g); g.connect(drums); play(o, t, t + 0.1);
  }
  function stroke(t, bol, vel, k) {
    switch (bol) {
      case 'dha': bayan(t, vel); dayan(t, vel, true); break;
      case 'dhin': bayan(t, vel, k === 13); dayan(t, vel, false); break; // rising "ghe" boom before the sam
      case 'ta': dayan(t, vel, true); break;
      case 'tin': dayan(t, vel, false); break;
      case 'ke': ke(t, vel); break;
      default: tap(t, vel); tap(t + 0.004, vel * 0.5, 4200); // te
    }
  }

  function manjira(t, open) { // small cymbals: inharmonic metallic partials + a little noise
    [3150, 4720, 6210].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); const dec = open ? 0.42 - i * 0.08 : 0.07;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.009 / (i + 1), t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g); g.connect(drums); play(o, t, t + dec + 0.02);
    });
    const src = ctx.createBufferSource(); src.buffer = noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(open ? 0.018 : 0.01, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.18 : 0.05));
    src.connect(hp); hp.connect(g); g.connect(drums); play(src, t, t + 0.2);
  }

  const TABLA = tablaScore();

  function scheduleLoop(t0) {
    veenaLead(t0);
    talaStrings(t0);
    for (let b = 0; b < BEATS; b += 2) tanpura(t0 + b * BEAT, TANPURA[(b / 2) % 4]);
    TABLA.forEach(([b, bol, v]) => stroke(t0 + b * BEAT, bol, v, b % 16));
    for (let b = 0; b < BEATS; b += 1) manjira(t0 + b * BEAT, b % 2 === 0);
  }

  function stopAll() {
    sources.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
    sources.clear();
  }

  return { scheduleLoop, stopAll };
}

/** Visibility handling shared by both engines: pause while the tab is hidden. */
function withVisibility(engine) {
  let pausedByHide = false;
  const onVis = () => {
    if (document.hidden && engine.isPlaying) { pausedByHide = true; engine.stop(); }
    else if (!document.hidden && pausedByHide) { pausedByHide = false; engine.start(); }
  };
  document.addEventListener('visibilitychange', onVis);
  const destroy = engine.destroy;
  engine.destroy = () => { document.removeEventListener('visibilitychange', onVis); destroy?.(); };
  return engine;
}

export function createMelody({ volume = 0.35 } = {}) {
  let ctx = null; let master = null; let graph = null;
  let playing = false; let vol = volume;
  let timer = 0; let fadeTimer = 0; let nextLoop = 0;

  const ensure = () => {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    graph = buildGraph(ctx, master);
  };
  // Lookahead scheduler: always keep the next loop booked a few seconds ahead, timed on the audio clock so it never drifts.
  const tick = () => {
    while (nextLoop < ctx.currentTime + 4) { graph.scheduleLoop(nextLoop); nextLoop += LOOP; }
  };

  const engine = {
    get isPlaying() { return playing; },
    start() {
      if (playing) return;
      ensure();
      playing = true;
      clearTimeout(fadeTimer);
      graph.stopAll();
      ctx.resume?.();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(vol, now + 2.5);
      nextLoop = now + 0.15;
      tick();
      timer = setInterval(tick, 500);
    },
    stop() {
      if (!playing) return;
      playing = false;
      clearInterval(timer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 1.2);
      fadeTimer = setTimeout(() => { if (!playing) { graph.stopAll(); ctx.suspend?.(); } }, 1300);
    },
    setVolume(v) {
      vol = v;
      if (playing && ctx) master.gain.setTargetAtTime(v, ctx.currentTime, 0.3);
    },
    destroy() { clearInterval(timer); clearTimeout(fadeTimer); graph?.stopAll(); ctx?.close?.(); ctx = null; playing = false; },
  };
  return withVisibility(engine);
}

/** Same API for a real audio file (when `music` is set in src/config/wedding.js). */
export function createTrack(src, { volume = 0.5 } = {}) {
  const audio = new Audio(src);
  audio.loop = true; audio.preload = 'auto';
  let playing = false; let vol = volume; let raf = 0;
  const fadeTo = (target, ms, done) => {
    cancelAnimationFrame(raf);
    const from = audio.volume; const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      audio.volume = from + (target - from) * k;
      if (k < 1) raf = requestAnimationFrame(step); else done?.();
    };
    raf = requestAnimationFrame(step);
  };
  const engine = {
    get isPlaying() { return playing; },
    start() {
      if (playing) return;
      playing = true; audio.volume = 0;
      audio.play().then(() => fadeTo(vol, 2500)).catch(() => { playing = false; });
    },
    stop() {
      if (!playing) return;
      playing = false;
      fadeTo(0, 1200, () => { if (!playing) audio.pause(); });
    },
    setVolume(v) { vol = v; if (playing) audio.volume = v; },
    destroy() { cancelAnimationFrame(raf); audio.pause(); audio.src = ''; playing = false; },
  };
  return withVisibility(engine);
}

export const MELODY_INFO = {
  bpm: BPM, loopSeconds: LOOP, raga: 'Hamsadhwani', tala: 'Teentaal (16 beats)',
  barBeats: LEAD.map((bar) => bar.split(' ').reduce((s, x) => s + Number(x.split(':')[1]), 0)),
};
