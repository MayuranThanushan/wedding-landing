import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { SHELL } from '../../i18n/shell.js';
import { venues } from '../../config/wedding.js';
import { fmtTime, mapsLink } from '../../lib/format.js';

const H = 3600e3;

/** `?now=2027-02-12T10:00:00+05:30` lets you preview live mode before the day. */
function clockNow() {
  try {
    const q = new URLSearchParams(window.location.search).get('now');
    if (q) { const fake = new Date(q).getTime(); if (!Number.isNaN(fake)) return fake + (Date.now() - window.__liveStart); }
  } catch { /* ignore */ }
  return Date.now();
}
if (typeof window !== 'undefined') window.__liveStart ||= Date.now();

/**
 * During the wedding window (from 24 h before the first event until 24 h after the last)
 * shows a floating "Happening now / Up next" card. Hidden at all other times.
 */
export function useLiveState(events) {
  const [now, setNow] = useState(clockNow);
  useEffect(() => { const id = setInterval(() => setNow(clockNow()), 30e3); return () => clearInterval(id); }, []);
  if (!events.length) return null;
  const sorted = [...events].sort((a, b) => (a.start > b.start ? 1 : -1));
  const first = new Date(sorted[0].start).getTime();
  const last = new Date(sorted[sorted.length - 1].end).getTime();
  if (now < first - 24 * H || now > last + 24 * H) return null;
  const current = sorted.find((e) => now >= new Date(e.start).getTime() && now <= new Date(e.end).getTime());
  const next = sorted.find((e) => new Date(e.start).getTime() > now);
  return { now, current, next, over: now > last };
}

export default function LiveNow({ events }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang).live;
  const st = useLiveState(events);
  const [hidden, setHidden] = useState(false);
  if (!st || hidden) return null;

  const ev = st.current || st.next;
  let label; let when;
  if (st.over || !ev) {
    label = s.thanks; when = null;
  } else {
    const v = venues[ev.venue];
    const start = new Date(ev.start).getTime();
    if (st.current) {
      label = s.now;
      when = `${s.until} ${fmtTime(ev.end, t.locale, v.timeZone)}`;
    } else {
      label = s.next;
      const mins = Math.round((start - st.now) / 60e3);
      const day = new Date(ev.start).toDateString() === new Date(st.now).toDateString() ? s.today
        : new Date(start - 864e5).toDateString() === new Date(st.now).toDateString() ? s.tomorrow : '';
      when = mins < 180 ? `${s.in} ${mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`}`
        : `${day} ${ev.timeTbc ? t.parts[ev.part] : fmtTime(ev.start, t.locale, v.timeZone)}`.trim();
    }
  }

  return (
    <aside className={`live ${st.current ? 'is-now' : ''}`} aria-live="polite">
      <span className="live-dot" aria-hidden="true" />
      <div className="live-body">
        <span className="live-label">{label}</span>
        {ev && !st.over && <strong className="live-name">{ev.icon} {t.events[ev.id]}</strong>}
        {when && <span className="live-when">{when}</span>}
      </div>
      {ev && !st.over
        ? <a className="live-btn" href={mapsLink(venues[ev.venue])} target="_blank" rel="noreferrer">{s.directions}</a>
        : <a className="live-btn" href="#photos">{s.share}</a>}
      <button className="live-x" onClick={() => setHidden(true)} aria-label="Dismiss">×</button>
    </aside>
  );
}
