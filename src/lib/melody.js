// =====================================================================
// "Our song": an original instrumental love melody in raga Mohanam
// (S R2 G3 P D2, the major pentatonic), synthesised live with Web Audio.
// No samples, no external files, no copyright.
//
//   tanpura drone · soft pad chords · bansuri-style lead with glides and
//   late vibrato · veena plucks as a counter-melody in the second half
//
// API:  const m = createMelody();  m.start();  m.stop();  m.isPlaying;  m.setVolume(0.35);  m.destroy();
// createTrack(src) gives the same API for a real MP3 (used when `music` is set in config).
// =====================================================================

const BPM = 68;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const SA = 293.66; // D4 is Sa: a warm bansuri register
const SWARA = { S: 0, R: 2, G: 4, P: 7, D: 9 };

// Lead melody, one string per bar: "note:beats". Notes use the Carnatic swaras,
// with ".D" for the lower octave and "S'" for the upper one. A "~" prefix means
// glide into the note (gamaka-like slide); "-" is a rest.
// Phrases: call (1-2) → answer (3-4) → call rising (5-6) → answer, half cadence (7-8)
//          → high phrase (9-10) → descent and resolution on Sa (11-12).
const LEAD = [
  "G:1 ~P:.5 D:.5 ~P:2",
  'G:.5 R:.5 ~S:1 .D:2',
  'S:1 R:.5 G:.5 ~P:1 G:1',
  '~R:1.5 S:.5 ~R:2',
  "G:1 ~P:.5 D:.5 ~S':2",
  "D:.5 S':.5 ~D:1 ~P:2",
  'G:1 P:.5 G:.5 ~R:1 S:1',
  'R:1 ~G:1 ~R:1.5 -:.5',
  "P:1 D:1 ~S':1 R':1",
  "~G':2 R':1 ~S':1",
  'D:1 ~P:1 G:1 ~R:1',
  '~S:3 -:1',
];

// Chord per bar: semitone offsets from Sa (warm, low voicings)
const I = [-12, -8, -5, 0]; //      D  F# A  D
const vi = [-15, -12, -8, -3]; //   B  D  F# B
const IV = [-19, -15, -12, -7]; //  G  B  D  G
const Vsus = [-17, -12, -10, -5]; // A  D  E  A   (sus4: stays inside the raga)
const CHORDS = [I, vi, IV, Vsus, I, vi, IV, Vsus, IV, I, Vsus, I];

// Veena counter-melody, second half only: [bar, beat, note]
const PLUCKS = [
  [6, 0, '.P'], [6, 2, 'S'],
  [7, 0, '.D'], [7, 1.5, 'S'], [7, 2, 'R'], [7, 3, 'G'],
  [8, 0, 'G'], [8, 2, 'P'],
  [9, 0, "S'"], [9, 1, 'P'], [9, 2, 'G'], [9, 3, 'P'],
  [10, 0, 'R'], [10, 2, '.D'],
  [11, 0, 'S'], [11, 0.5, 'G'], [11, 1, 'P'], [11, 2, "S'"],
];

// Tanpura cycle per bar: Pa, Sa', Sa', low Sa
const TANPURA = [-17, -12, -12, -24];

const LOOP = BAR * LEAD.length; // about 42 s

function parseNote(tok) {
  const glide = tok.startsWith('~');
  let n = glide ? tok.slice(1) : tok;
  if (n === '-') return { rest: true };
  let oct = 0;
  if (n.startsWith('.')) { oct = -12; n = n.slice(1); }
  if (n.endsWith("'")) { oct = 12; n = n.slice(0, -1); }
  return { semi: SWARA[n] + oct, glide };
}
const hz = (semi) => SA * 2 ** (semi / 12);

const SCORE = LEAD.flatMap((bar, b) => {
  let beat = 0;
  return bar.split(' ').map((item) => {
    const [tok, len] = item.split(':');
    const note = { ...parseNote(tok), at: b * BAR + beat * BEAT, dur: Number(len) * BEAT };
    beat += Number(len);
    return note;
  });
});

function makeImpulse(ctx, seconds = 3, decay = 2.8) {
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

/** Builds the audio graph on `ctx` and returns a scheduler for one loop starting at time t0. */
export function buildGraph(ctx, out) {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.02; comp.release.value = 0.4;
  comp.connect(out);
  const dry = ctx.createGain(); dry.gain.value = 0.85; dry.connect(comp);
  const verb = ctx.createConvolver(); verb.buffer = makeImpulse(ctx);
  const wet = ctx.createGain(); wet.gain.value = 0.32;
  verb.connect(wet); wet.connect(comp);
  const bus = ctx.createGain(); bus.connect(dry); bus.connect(verb);
  const noise = makeNoise(ctx);
  const padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 1100; padFilter.Q.value = 0.4;
  padFilter.connect(bus);

  const sources = new Set();
  const play = (node, t0, t1) => {
    node.start(t0); node.stop(t1);
    sources.add(node);
    node.onended = () => sources.delete(node);
  };

  function tanpura(t, semi) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.028, t + 0.015);
    g.gain.setTargetAtTime(0, t + 0.06, 1.1);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(3200, t);
    f.frequency.exponentialRampToValueAtTime(650, t + 2.6); // the slowly closing "jawari" buzz
    f.connect(g); g.connect(bus);
    [-3, 4].forEach((cents) => { // two strings slightly apart, so they shimmer
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.value = hz(semi); o.detune.value = cents;
      o.connect(f); play(o, t, t + 5.5);
    });
  }

  function pad(t, chord) {
    chord.forEach((semi) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.02, t + 1.4);
      g.gain.setValueAtTime(0.02, t + BAR);
      g.gain.linearRampToValueAtTime(0, t + BAR + 1.6);
      g.connect(padFilter);
      [-6, 6].forEach((cents) => {
        const o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.value = hz(semi); o.detune.value = cents;
        o.connect(g); play(o, t, t + BAR + 1.8);
      });
    });
  }

  function veena(t, semi) {
    const f0 = hz(semi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(900, t + 1.2);
    lp.connect(g); g.connect(bus);
    const o1 = ctx.createOscillator(); o1.type = 'triangle';
    o1.frequency.setValueAtTime(f0 * 0.985, t); o1.frequency.exponentialRampToValueAtTime(f0, t + 0.06); // small meend into the note
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f0 * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.3;
    o1.connect(lp); o2.connect(g2); g2.connect(lp);
    play(o1, t, t + 1.8); play(o2, t, t + 1.8);
  }

  function breath(t, f0) {
    const src = ctx.createBufferSource(); src.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(6000, f0 * 2.2); bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(bp); bp.connect(g); g.connect(bus);
    play(src, t, t + 0.25);
  }

  /** The bansuri: one continuous voice per loop, so legato notes and glides stay smooth. */
  function lead(t0) {
    const o1 = ctx.createOscillator(); o1.type = 'sine';
    const o2 = ctx.createOscillator(); o2.type = 'triangle';
    const o2g = ctx.createGain(); o2g.gain.value = 0.22;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2800; lp.Q.value = 0.5;
    const amp = ctx.createGain(); amp.gain.setValueAtTime(0, t0);
    o1.connect(lp); o2.connect(o2g); o2g.connect(lp); lp.connect(amp); amp.connect(bus);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.2;
    const depth = ctx.createGain(); depth.gain.setValueAtTime(0, t0);
    lfo.connect(depth); depth.connect(o1.frequency); depth.connect(o2.frequency);

    let prev = null;
    SCORE.forEach((n, i) => {
      const t = t0 + n.at;
      if (n.rest) {
        amp.gain.setTargetAtTime(0, t, 0.09);
        depth.gain.setTargetAtTime(0, t, 0.05);
        prev = null;
        return;
      }
      const f = hz(n.semi);
      const long = n.dur >= 1.2;
      const phraseLift = i > SCORE.length * 0.6 ? 1.08 : 1; // the high phrase sings a little louder
      const L = 0.17 * phraseLift * (long ? 1 : 0.92);
      [o1, o2].forEach((o) => {
        if (prev == null) o.frequency.setValueAtTime(f, t);
        else {
          o.frequency.setValueAtTime(prev, t);
          o.frequency.linearRampToValueAtTime(f, t + (n.glide ? 0.14 : 0.025));
        }
      });
      if (prev == null) {
        amp.gain.setTargetAtTime(L, t, 0.035);
        breath(t, f);
      } else if (n.glide) {
        amp.gain.setTargetAtTime(L, t, 0.05);
      } else {
        amp.gain.setTargetAtTime(L * 0.5, t - 0.035, 0.012); // light tonguing between notes
        amp.gain.setTargetAtTime(L, t + 0.01, 0.03);
        breath(t, f);
      }
      depth.gain.setTargetAtTime(0, t, 0.04);
      if (long) {
        amp.gain.setTargetAtTime(L * 1.08, t + 0.25, n.dur * 0.3); // gentle swell
        amp.gain.setTargetAtTime(L * 0.86, t + n.dur * 0.72, 0.2);
        depth.gain.setTargetAtTime(f * 0.0065, t + Math.min(0.45, n.dur * 0.4), 0.25); // vibrato arrives late
      }
      prev = f;
    });
    const end = t0 + LOOP + 0.6;
    [o1, o2, lfo].forEach((o) => play(o, t0, end));
  }

  function scheduleLoop(t0) {
    lead(t0);
    CHORDS.forEach((c, b) => pad(t0 + b * BAR, c));
    for (let b = 0; b < LEAD.length; b += 1) TANPURA.forEach((s, k) => tanpura(t0 + b * BAR + k * BEAT, s));
    PLUCKS.forEach(([b, beat, tok]) => veena(t0 + b * BAR + beat * BEAT, parseNote(tok).semi));
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

export const MELODY_INFO = { bpm: BPM, loopSeconds: LOOP, raga: 'Mohanam' };
