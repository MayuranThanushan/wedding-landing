/* Traditional South-Indian wedding ornaments, drawn as inline SVG so they stay crisp and light. */

const LEAF = 'M0 0 C 7 9, 9 25, 0 42 C -9 25, -7 9, 0 0 Z';

/** Thoranam: mango leaves and marigolds strung along a gently sagging thread. */
export function Thoranam({ className = '', count = 15 }) {
  const W = 600; const sag = 26;
  const y = (x) => 10 + sag * (1 - ((x - W / 2) / (W / 2)) ** 2);
  const items = Array.from({ length: count }, (_, i) => {
    const x = 18 + (i * (W - 36)) / (count - 1);
    return { x, y: y(x), k: i };
  });
  return (
    <svg className={`orn-thoranam ${className}`} viewBox={`0 0 ${W} 96`} preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <defs>
        <linearGradient id="orn-leaf" x1="0" x2="1">
          <stop offset="0" stopColor="#2f7d32" /><stop offset=".5" stopColor="#4caf50" /><stop offset="1" stopColor="#1b5e20" />
        </linearGradient>
        <radialGradient id="orn-mari" cx=".4" cy=".35">
          <stop offset="0" stopColor="#ffe082" /><stop offset=".55" stopColor="#ffb300" /><stop offset="1" stopColor="#ef6c00" />
        </radialGradient>
      </defs>
      <path d={`M0 10 Q ${W / 2} ${10 + sag * 2} ${W} 10`} fill="none" stroke="#b8862b" strokeWidth="1.6" />
      {items.map(({ x, y: yy, k }) => (k % 2 === 0
        ? (
          <g key={k} className="orn-sway" style={{ '--i': k }} transform={`translate(${x} ${yy})`}>
            <g transform={`rotate(${(k % 4 === 0 ? -1 : 1) * 4})`}>
              <path d={LEAF} fill="url(#orn-leaf)" />
              <path d="M0 2 L0 40" stroke="#c5e1a5" strokeWidth=".8" />
            </g>
          </g>
        )
        : (
          <g key={k} transform={`translate(${x} ${yy + 4})`}>
            {Array.from({ length: 10 }, (_, p) => (
              <circle key={p} cx={7 * Math.cos((p / 10) * Math.PI * 2)} cy={7 * Math.sin((p / 10) * Math.PI * 2)} r="4.2" fill="#fb8c00" />
            ))}
            <circle r="7" fill="url(#orn-mari)" />
            <circle r="2.2" fill="#e65100" />
            <circle cy="15" r="3.5" fill="#fdd835" />
            <circle cy="21" r="2.4" fill="#fff8e1" />
          </g>
        )))}
    </svg>
  );
}

/** Kalasam / Purna Kumbham: brass pot crowned with mango leaves and a coconut. */
export function Kalasam({ className = '' }) {
  return (
    <svg className={`orn-kalasam ${className}`} viewBox="0 0 100 130" aria-hidden="true">
      <defs>
        <linearGradient id="orn-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8d5b12" /><stop offset=".35" stopColor="#f7d774" /><stop offset=".6" stopColor="#d4a02a" /><stop offset="1" stopColor="#7a4b0c" />
        </linearGradient>
        <radialGradient id="orn-coco" cx=".4" cy=".35"><stop offset="0" stopColor="#a1774a" /><stop offset="1" stopColor="#5d3a1a" /></radialGradient>
      </defs>
      {[-58, -32, -10, 10, 32, 58].map((r) => (
        <g key={r} transform={`translate(50 44) rotate(${r + 180})`}><path d={LEAF} fill="#2e7d32" /><path d="M0 2 L0 40" stroke="#a5d6a7" strokeWidth=".7" /></g>
      ))}
      <ellipse cx="50" cy="30" rx="15" ry="17" fill="url(#orn-coco)" />
      <path d="M44 15 Q50 6 56 15" fill="none" stroke="#6d4c22" strokeWidth="2" />
      <rect x="33" y="44" width="34" height="7" rx="3" fill="url(#orn-brass)" />
      <path d="M38 51 C 36 56, 36 58, 30 64 C 14 80, 18 112, 50 116 C 82 112, 86 80, 70 64 C 64 58, 64 56, 62 51 Z" fill="url(#orn-brass)" />
      <path d="M24 80 Q50 90 76 80" fill="none" stroke="#c62828" strokeWidth="2.4" />
      <path d="M22 88 Q50 98 78 88" fill="none" stroke="#fff3e0" strokeWidth="1.4" strokeDasharray="2 3" />
      <circle cx="50" cy="72" r="4" fill="#c62828" /><circle cx="50" cy="72" r="1.6" fill="#ffeb3b" />
      <ellipse cx="50" cy="121" rx="24" ry="5" fill="url(#orn-brass)" />
    </svg>
  );
}

/** Kolam (rangoli) corner: dot grid wrapped in looping lines, in kumkum red and gold. */
export function KolamCorner({ className = '' }) {
  const dots = [];
  for (let r = 0; r < 4; r += 1) for (let c = 0; c < 4 - r; c += 1) dots.push([14 + c * 16, 14 + r * 16]);
  return (
    <svg className={`orn-kolam ${className}`} viewBox="0 0 90 90" aria-hidden="true">
      <path d="M6 6 H84 M6 6 V84" stroke="#c62828" strokeWidth="1.4" />
      <path d="M10 10 H70 M10 10 V70" stroke="#d4a02a" strokeWidth="1" />
      {dots.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill="#c62828" />)}
      <path d="M6 30 C 22 30, 30 22, 30 6 M6 46 C 34 46, 46 34, 46 6 M6 62 C 46 62, 62 46, 62 6" fill="none" stroke="#d4a02a" strokeWidth="1.2" />
      <path d="M22 22 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0" fill="none" stroke="#c62828" strokeWidth="1.1" />
      <path d="M22 22 l0 -5 M22 22 l5 0 M22 22 l0 5 M22 22 l-5 0" stroke="#d4a02a" strokeWidth="1" />
      <circle cx="78" cy="6" r="3" fill="#fb8c00" /><circle cx="6" cy="78" r="3" fill="#fb8c00" />
    </svg>
  );
}

/** Clay diya with a flickering flame. */
export function Diya({ className = '', delay = 0 }) {
  return (
    <svg className={`orn-diya ${className}`} viewBox="0 0 60 60" aria-hidden="true" style={{ '--fd': `${delay}s` }}>
      <defs>
        <radialGradient id="orn-flame" cx=".5" cy=".7"><stop offset="0" stopColor="#fffde7" /><stop offset=".45" stopColor="#ffd54f" /><stop offset="1" stopColor="#ff6f00" /></radialGradient>
        <radialGradient id="orn-glow"><stop offset="0" stopColor="rgba(255,193,7,.55)" /><stop offset="1" stopColor="rgba(255,193,7,0)" /></radialGradient>
        <linearGradient id="orn-clay" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e64a19" /><stop offset="1" stopColor="#8d2a0b" /></linearGradient>
      </defs>
      <circle className="orn-glow" cx="30" cy="22" r="20" fill="url(#orn-glow)" />
      <path className="orn-flame" d="M30 6 C 36 16, 37 24, 30 30 C 23 24, 24 16, 30 6 Z" fill="url(#orn-flame)" />
      <path d="M6 36 Q30 30 54 36 Q50 52 30 53 Q10 52 6 36 Z" fill="url(#orn-clay)" />
      <path d="M8 37 Q30 33 52 37" fill="none" stroke="#ffcc80" strokeWidth="1.2" />
      <path d="M14 44 h4 M22 46 h4 M34 46 h4 M42 44 h4" stroke="#ffe082" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
