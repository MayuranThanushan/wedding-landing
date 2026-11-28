import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import { eventById, mainEventId, venues } from '../config/wedding.js';
import { eventWhen, fmtDate } from '../lib/format.js';
import { downloadIcs, googleCalUrl } from '../lib/calendar.js';
import { Bell, LotusRule, PaisleyCorner } from './ui/Ornaments.jsx';

const directionsLink = (v) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v.mapQuery)}`;

/** "Mr. A & Mrs. B" → two lines so names never break mid-way on phones. */
function Parents({ text }) {
  const [a, b] = text.split(/\s+[&–]\s+/);
  return (
    <p className="iv-parents">
      <span>{a}</span>
      {b && <><span className="iv-parents-amp">&amp;</span><span>{b}</span></>}
    </p>
  );
}

function CalendarMenu({ ev }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <div className="cal-menu" ref={ref}>
      <button className="iv-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>📅 {t.addToCalendar}</button>
      {open && (
        <div className="cal-pop">
          <a href={googleCalUrl(ev, t)} target="_blank" rel="noreferrer">{t.googleCalendar}</a>
          <button onClick={() => { downloadIcs([ev], t, `${ev.id}.ics`); setOpen(false); }}>{t.appleCalendar}</button>
        </div>
      )}
    </div>
  );
}

/**
 * The invitation card, with the reception details printed on it like a real card:
 * temple-arch shape, hanging bells, Ganesha medallion, paisley corners, lotus dividers.
 */
export default function InviteText() {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const i = t.invite;
  const ev = eventById[mainEventId];
  const v = venues[ev.venue];
  const d = (o) => fmtDate(ev.start, t.locale, v.timeZone, { weekday: undefined, day: undefined, month: undefined, year: undefined, ...o });

  return (
    <section className="sec iv" id="invitation">
      <div className="iv-card">
        <Bell className="iv-bell l" /><Bell className="iv-bell r" delay={0.6} />
        <div className="iv-paper">
          <PaisleyCorner className="iv-corner bl" /><PaisleyCorner className="iv-corner br" />
          <div className="iv-medallion"><img src="/assets/art/ganesha-pink.webp" alt="Lord Ganesha" /></div>
          <p className="iv-srirastu" lang="te">శ్రీరస్తు · శుభమస్తు · అవిఘ్నమస్తు</p>
          <p className="iv-invocation">{t.invocation}</p>

          <p className="iv-blessing">{i.blessing}</p>
          <Parents text={i.groomParents} />
          <p className="iv-and">{i.and}</p>
          <Parents text={i.brideParents} />
          <p className="iv-request">{i.request}</p>

          <h2 className="iv-couple">
            <span>{i.groom}</span>
            <span className="iv-weds">{lang === 'en' ? 'with' : '&'}</span>
            <span>{i.bride}</span>
          </h2>

          <LotusRule className="iv-rule" />

          <p className="iv-occasion">{s.reception}</p>
          <div className="iv-date">
            <span className="iv-date-side">{d({ weekday: 'long' })}</span>
            <span className="iv-date-mid">
              <b>{d({ day: 'numeric' })}</b>
              <span className="nowrap">{d({ month: 'long', year: 'numeric' })}</span>
            </span>
            <span className="iv-date-side">{eventWhen(ev, t).time}</span>
          </div>
          <p className="iv-hall">{v.hall}</p>
          <p className="iv-venue">{v.name} · Colombo 03</p>

          <div className="iv-actions">
            <a className="btn btn-pink" href="#rsvp">{s.rsvpCta}</a>
            <CalendarMenu ev={ev} />
            <a className="iv-link" href={directionsLink(v)} target="_blank" rel="noreferrer">➤ {t.directions}</a>
          </div>

          <LotusRule className="iv-rule small" />
          <p className="iv-closing">{i.closing}</p>
          <p className="iv-note">{s.weddingNote}</p>
        </div>
      </div>
    </section>
  );
}
