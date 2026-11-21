// Hand-rolled SVG/HTML charts for the dashboard (no chart library).
// Palette validated with the dataviz validator (light surface): pink · gold · blue,
// always assigned in this fixed order. "Pending" is a neutral, not a category hue.
import { useRef, useState } from 'react';

export const SERIES = ['var(--c1)', 'var(--c2)', 'var(--c3)'];
export const NEUTRAL = 'var(--c-neutral)';

const fmtPct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '0%');

function Legend({ items }) {
  return (
    <ul className="viz-legend">
      {items.map((it) => (
        <li key={it.label}><i style={{ background: it.color }} className={it.hatch ? 'hatch' : ''} />{it.label}</li>
      ))}
    </ul>
  );
}

function Tip({ tip }) {
  if (!tip) return null;
  return (
    <div className="viz-tip" style={{ left: tip.x, top: tip.y }} role="status">
      {tip.title && <strong>{tip.title}</strong>}
      {tip.lines.map((l) => (
        <div key={l.label} className="viz-tip-row">
          {l.color && <i style={{ background: l.color }} />}<span>{l.label}</span><b>{l.value}</b>
        </div>
      ))}
    </div>
  );
}

/** Tooltip position relative to the chart box, from a pointer event. */
function useTip() {
  const box = useRef(null);
  const [tip, setTip] = useState(null);
  const show = (e, title, lines) => {
    const r = box.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - r.left, 70), r.width - 70);
    setTip({ x, y: e.clientY - r.top, title, lines });
  };
  return { box, tip, show, hide: () => setTip(null) };
}

/**
 * Horizontal stacked bars, one row per category.
 * rows: [{ label, href?, values: { [key]: n } }]; series: [{ key, label, color, hatch? }]
 */
export function StackedBars({ rows, series, unit = 'families' }) {
  const { box, tip, show, hide } = useTip();
  const max = Math.max(1, ...rows.map((r) => series.reduce((n, s) => n + (r.values[s.key] || 0), 0)));
  return (
    <div className="viz" ref={box} onPointerLeave={hide}>
      <Legend items={series} />
      <div className="viz-bars">
        {rows.map((r) => {
          const total = series.reduce((n, s) => n + (r.values[s.key] || 0), 0);
          const lines = series.map((s) => ({ label: s.label, color: s.color, value: `${r.values[s.key] || 0} (${fmtPct(r.values[s.key] || 0, total)})` }));
          return (
            <div className="viz-bar-row" key={r.label}
              onPointerMove={(e) => show(e, `${r.label} · ${total} ${unit}`, lines)}>
              <span className="viz-bar-label">{r.label}</span>
              <div className="viz-bar-track" role="img" aria-label={`${r.label}: ${lines.map((l) => `${l.label} ${l.value}`).join(', ')}`}>
                {series.map((s) => {
                  const v = r.values[s.key] || 0;
                  if (!v) return null;
                  return <span key={s.key} className={`viz-seg ${s.hatch ? 'hatch' : ''}`} style={{ width: `${(v / max) * 100}%`, background: s.color }} />;
                })}
              </div>
              <span className="viz-bar-total">{r.values[series[0].key] || 0}<small>/{total}</small></span>
            </div>
          );
        })}
      </div>
      <Tip tip={tip} />
    </div>
  );
}

/** One 100% bar showing parts of a whole, direct-labelled (≤ 4 parts). parts: [{ label, value, color }] */
export function PartBar({ parts, unit = '' }) {
  const { box, tip, show, hide } = useTip();
  const total = parts.reduce((n, p) => n + p.value, 0);
  return (
    <div className="viz" ref={box} onPointerLeave={hide}>
      <div className="viz-part" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
        {total === 0 && <span className="viz-seg empty" style={{ width: '100%' }} />}
        {parts.filter((p) => p.value).map((p) => (
          <span key={p.label} className="viz-seg" style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
            onPointerMove={(e) => show(e, p.label, [{ label: unit || 'Count', value: `${p.value} (${fmtPct(p.value, total)})`, color: p.color }])} />
        ))}
      </div>
      <ul className="viz-part-labels">
        {parts.map((p) => (
          <li key={p.label}><i style={{ background: p.color }} /><span>{p.label}</span><b>{p.value}</b><small>{fmtPct(p.value, total)}</small></li>
        ))}
      </ul>
      <Tip tip={tip} />
    </div>
  );
}

/** Funnel as single-series horizontal bars. steps: [{ label, value }] — % is of the first step. */
export function Funnel({ steps }) {
  const { box, tip, show, hide } = useTip();
  const top = Math.max(1, steps[0]?.value || 0);
  return (
    <div className="viz" ref={box} onPointerLeave={hide}>
      <div className="viz-funnel">
        {steps.map((s, i) => {
          const prev = i ? steps[i - 1].value : s.value;
          return (
            <div className="viz-bar-row" key={s.label}
              onPointerMove={(e) => show(e, s.label, [
                { label: 'Families', value: s.value },
                { label: 'Of invited', value: fmtPct(s.value, top) },
                ...(i ? [{ label: 'Of previous step', value: fmtPct(s.value, prev) }] : []),
              ])}>
              <span className="viz-bar-label">{s.label}</span>
              <div className="viz-bar-track"><span className="viz-seg" style={{ width: `${(s.value / top) * 100}%`, background: SERIES[0] }} /></div>
              <span className="viz-bar-total">{s.value}<small> · {fmtPct(s.value, top)}</small></span>
            </div>
          );
        })}
      </div>
      <Tip tip={tip} />
    </div>
  );
}

/**
 * Cumulative line over days. points: [{ date: 'YYYY-MM-DD', value }] sorted; `total` draws a dashed goal line.
 */
export function CumulativeLine({ points, total }) {
  const { box, tip, show, hide } = useTip();
  const [hover, setHover] = useState(null);
  if (!points.length) return <p className="adm-muted">No responses yet — the curve starts with the first RSVP.</p>;
  const W = 640; const H = 220; const P = { l: 34, r: 14, t: 14, b: 26 };
  const max = Math.max(total || 0, ...points.map((p) => p.value), 1);
  const t0 = new Date(points[0].date).getTime();
  const t1 = Math.max(new Date(points[points.length - 1].date).getTime(), t0 + 864e5);
  const x = (d) => P.l + ((new Date(d).getTime() - t0) / (t1 - t0)) * (W - P.l - P.r);
  const y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
  let d = '';
  points.forEach((p, i) => {
    d += i === 0 ? `M${x(p.date)},${y(0)} L${x(p.date)},${y(p.value)}` : ` H${x(p.date)} V${y(p.value)}`;
  });
  const area = `${d} V${y(0)} Z`;
  const ticks = [0, Math.round(max / 2), max];
  const fmt = (s) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const onMove = (e) => {
    const svg = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - svg.left) / svg.width) * W;
    let best = points[0];
    for (const p of points) if (x(p.date) <= px + 1) best = p;
    setHover(best);
    show(e, fmt(best.date), [{ label: 'Families responded', value: best.value, color: SERIES[0] }, ...(total ? [{ label: 'Of invited', value: fmtPct(best.value, total) }] : [])]);
  };
  return (
    <div className="viz" ref={box} onPointerLeave={() => { hide(); setHover(null); }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" onPointerMove={onMove} role="img"
        aria-label={`Responses over time: ${points[points.length - 1].value} of ${total} families by ${fmt(points[points.length - 1].date)}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="viz-grid" />
            <text x={P.l - 6} y={y(t) + 4} className="viz-axis" textAnchor="end">{t}</text>
          </g>
        ))}
        {total > 0 && <line x1={P.l} x2={W - P.r} y1={y(total)} y2={y(total)} className="viz-goal" />}
        {total > 0 && <text x={W - P.r} y={y(total) - 5} className="viz-axis" textAnchor="end">{total} invited</text>}
        <path d={area} fill={SERIES[0]} opacity=".1" />
        <path d={d} fill="none" stroke={SERIES[0]} strokeWidth="2" strokeLinejoin="round" />
        <text x={P.l} y={H - 6} className="viz-axis">{fmt(points[0].date)}</text>
        <text x={W - P.r} y={H - 6} className="viz-axis" textAnchor="end">{fmt(points[points.length - 1].date)}</text>
        {hover && (
          <g>
            <line x1={x(hover.date)} x2={x(hover.date)} y1={P.t} y2={H - P.b} className="viz-cross" />
            <circle cx={x(hover.date)} cy={y(hover.value)} r="5" fill={SERIES[0]} stroke="var(--a-card)" strokeWidth="2" />
          </g>
        )}
        <rect x={P.l} y={P.t} width={W - P.l - P.r} height={H - P.t - P.b} fill="transparent" />
      </svg>
      <Tip tip={tip} />
    </div>
  );
}
