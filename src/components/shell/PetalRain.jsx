import { useEffect, useRef } from 'react';

/**
 * Falling marigold & rose petals, jasmine, tiny lotuses and twinkling gold glitter.
 *  - tap/click anywhere → petal burst at that point
 *  - mouse move (desktop) → sparkle trail
 *  - scrolling → a breeze that pushes petals
 *  - window.dispatchEvent(new Event('petals:shower')) → big shower from the top
 * Pointer-events: none, so it never blocks the page. Off for prefers-reduced-motion.
 */
export function petalShower() { window.dispatchEvent(new Event('petals:shower')); }

const PALETTES = {
  marigold: ['#ffb300', '#fb8c00', '#ffca28', '#f57c00'],
  rose: ['#e91e63', '#c2185b', '#f06292', '#d81b60', '#ad1457'],
  jasmine: ['#fffdf5'],
};
const rand = (a, b) => a + Math.random() * (b - a);
const pickOf = (arr) => arr[(Math.random() * arr.length) | 0];

function makeParticle(W, H, opts = {}) {
  const r = Math.random();
  const kind = opts.kind || (r < 0.38 ? 'marigold' : r < 0.72 ? 'rose' : r < 0.9 ? 'jasmine' : r < 0.96 ? 'flower' : 'lotus');
  const size = kind === 'lotus' ? rand(18, 28) : kind === 'jasmine' ? rand(6, 9) : kind === 'flower' ? rand(9, 13) : rand(7, 13);
  return {
    kind, size,
    color: kind === 'flower' ? pickOf(PALETTES.marigold) : pickOf(PALETTES[kind] || PALETTES.rose),
    x: opts.x ?? rand(-20, W + 20),
    y: opts.y ?? rand(-H, -20),
    vx: opts.vx ?? rand(-0.15, 0.15),
    vy: opts.vy ?? rand(0.35, 1.0) * (kind === 'lotus' ? 0.6 : 1),
    rot: rand(0, Math.PI * 2), vr: rand(-0.025, 0.025),
    flip: rand(0, Math.PI * 2), vflip: rand(0.02, 0.06),
    sway: rand(0, Math.PI * 2), swayAmp: rand(0.3, 0.9),
    gravity: opts.gravity ?? 0, life: opts.life ?? Infinity, burst: !!opts.burst,
  };
}

function makeGlitter(W, H, opts = {}) {
  return {
    x: opts.x ?? rand(0, W), y: opts.y ?? rand(0, H),
    vx: opts.vx ?? rand(-0.1, 0.1), vy: opts.vy ?? rand(-0.25, -0.05),
    size: opts.size ?? rand(1.2, 3), t: rand(0, Math.PI * 2), vt: rand(0.04, 0.09),
    color: pickOf(['#fff3b0', '#ffd54f', '#ffe082', '#ffffff', '#f8bbd0']),
    life: opts.life ?? Infinity, gravity: opts.gravity ?? 0,
  };
}

function drawPetal(g, p) {
  const s = p.size;
  g.fillStyle = p.color;
  g.beginPath();
  if (p.kind === 'marigold') {
    g.moveTo(0, -s); g.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.8, 0, s);
    g.bezierCurveTo(-s * 0.7, s * 0.8, -s * 0.9, -s * 0.6, 0, -s);
  } else { // rose: rounded heart-ish petal
    g.moveTo(0, s); g.bezierCurveTo(s * 1.2, s * 0.2, s * 0.8, -s, 0, -s * 0.55);
    g.bezierCurveTo(-s * 0.8, -s, -s * 1.2, s * 0.2, 0, s);
  }
  g.fill();
  g.globalAlpha *= 0.35; g.strokeStyle = '#fff'; g.lineWidth = 0.6;
  g.beginPath(); g.moveTo(0, -s * 0.5); g.lineTo(0, s * 0.7); g.stroke();
}

function drawFlower(g, p, petals, inner) {
  const s = p.size;
  g.fillStyle = p.color;
  for (let i = 0; i < petals; i += 1) {
    g.save(); g.rotate((i / petals) * Math.PI * 2);
    g.beginPath(); g.ellipse(0, -s * 0.55, s * 0.32, s * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  g.fillStyle = inner; g.beginPath(); g.arc(0, 0, s * 0.22, 0, Math.PI * 2); g.fill();
}

function drawStar(g, x, y, r, color, a) {
  g.globalAlpha = a; g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, y - r * 2.4); g.quadraticCurveTo(x, y, x + r * 2.4, y); g.quadraticCurveTo(x, y, x, y + r * 2.4);
  g.quadraticCurveTo(x, y, x - r * 2.4, y); g.quadraticCurveTo(x, y, x, y - r * 2.4);
  g.fill();
}

export default function PetalRain() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const canvas = ref.current;
    const g = canvas.getContext('2d');
    const lotus = new Image(); lotus.src = '/assets/art/lotus.webp';
    let W = 0; let H = 0; let dpr = 1;
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const BASE = mobile ? 20 : 34;
    const GLITTER = mobile ? 18 : 34;
    let petals = []; let glitter = []; let wind = 0; let lastY = window.scrollY; let raf = 0; let last = performance.now();

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    };
    resize();
    petals = Array.from({ length: BASE }, () => makeParticle(W, H, { y: rand(-H, H) }));
    glitter = Array.from({ length: GLITTER }, () => makeGlitter(W, H));

    const burst = (x, y, n = 16) => {
      for (let i = 0; i < n; i += 1) {
        const a = rand(0, Math.PI * 2); const sp = rand(1.5, 4.5);
        petals.push(makeParticle(W, H, { x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, gravity: 0.06, life: rand(120, 200), burst: true }));
      }
      for (let i = 0; i < n; i += 1) {
        const a = rand(0, Math.PI * 2); const sp = rand(0.8, 3.2);
        glitter.push(makeGlitter(W, H, { x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, gravity: 0.02, life: rand(50, 100), size: rand(1.5, 3.2) }));
      }
    };
    const shower = () => {
      for (let i = 0; i < (mobile ? 45 : 80); i += 1) {
        petals.push(makeParticle(W, H, { y: rand(-H * 0.6, -10), vy: rand(1.2, 2.6), life: 600, burst: true }));
      }
    };

    const onDown = (e) => {
      if (e.target.closest?.('input, textarea, select, iframe')) return;
      burst(e.clientX, e.clientY, mobile ? 12 : 16);
    };
    let lastTrail = 0;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - lastTrail < 40) return;
      lastTrail = now;
      glitter.push(makeGlitter(W, H, { x: e.clientX, y: e.clientY, vx: rand(-0.4, 0.4), vy: rand(0.2, 0.8), life: rand(30, 55), size: rand(1, 2.2) }));
    };
    const onScroll = () => { const y = window.scrollY; wind += Math.max(-6, Math.min(6, (y - lastY) * 0.03)); lastY = y; };
    const onVis = () => { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(tick); } };

    function tick(now) {
      const dt = Math.min(3, (now - last) / 16.67); last = now;
      wind *= 0.94;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);

      for (let i = petals.length - 1; i >= 0; i -= 1) {
        const p = petals[i];
        p.sway += 0.02 * dt; p.flip += p.vflip * dt; p.rot += p.vr * dt;
        p.vy += p.gravity * dt;
        if (p.burst && p.gravity) { p.vx *= 0.985; if (p.vy > 1.4) p.vy = 1.4; }
        p.x += (p.vx + Math.sin(p.sway) * p.swayAmp + wind * 0.4) * dt;
        p.y += (p.vy - wind * 0.15) * dt;
        p.life -= dt;
        const fade = p.life < 40 ? Math.max(0, p.life / 40) : 1;
        if (p.y > H + 30 || p.life <= 0 || p.x < -60 || p.x > W + 60) {
          if (!p.burst && petals.length <= BASE + 200) { Object.assign(p, makeParticle(W, H)); } else { petals.splice(i, 1); }
          continue;
        }
        g.save();
        g.translate(p.x, p.y); g.rotate(p.rot);
        g.globalAlpha = 0.9 * fade;
        if (p.kind === 'lotus') {
          if (lotus.complete) g.drawImage(lotus, -p.size, -p.size * 0.7, p.size * 2, p.size * 1.4);
        } else {
          g.scale(Math.cos(p.flip) * 0.75 + 0.25 * Math.sign(Math.cos(p.flip) || 1), 1);
          if (p.kind === 'jasmine') drawFlower(g, p, 5, '#fff3b0');
          else if (p.kind === 'flower') drawFlower(g, p, 8, '#e65100');
          else drawPetal(g, p);
        }
        g.restore();
      }

      for (let i = glitter.length - 1; i >= 0; i -= 1) {
        const s = glitter[i];
        s.t += s.vt * dt; s.vy += s.gravity * dt;
        s.x += (s.vx + wind * 0.2) * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.life <= 0 || s.y < -10 || s.y > H + 10) {
          if (s.life === Infinity) Object.assign(s, makeGlitter(W, H, { y: H + 5 }));
          else glitter.splice(i, 1);
          continue;
        }
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(s.t));
        const fade = s.life < 30 ? s.life / 30 : 1;
        drawStar(g, s.x, s.y, s.size * (0.6 + tw * 0.4), s.color, tw * fade * 0.9);
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('petals:shower', shower);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('petals:shower', shower);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return <canvas ref={ref} className="petal-rain" aria-hidden="true" />;
}
