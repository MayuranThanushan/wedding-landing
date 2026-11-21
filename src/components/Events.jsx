import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { venues } from '../config/wedding.js';
import { eventWhen, fmtDate, mapsLink } from '../lib/format.js';
import { googleCalUrl, downloadIcs } from '../lib/calendar.js';
import Reveal from './Reveal.jsx';

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
      <button className="chip" onClick={() => setOpen((o) => !o)} aria-expanded={open}>📅 {t.addToCalendar}</button>
      {open && (
        <div className="cal-pop">
          <a href={googleCalUrl(ev, t)} target="_blank" rel="noreferrer">{t.googleCalendar}</a>
          <button onClick={() => { downloadIcs([ev], t, `${ev.id}.ics`); setOpen(false); }}>{t.appleCalendar}</button>
        </div>
      )}
    </div>
  );
}

export function EventCard({ ev }) {
  const { t, lang } = useLang();
  const v = venues[ev.venue];
  const { time } = eventWhen(ev, t);
  return (
    <Reveal as="article" className={`event-card ${ev.featured ? 'featured' : ''}`}>
      <div className="event-icon" aria-hidden="true">{ev.icon}</div>
      <h3 className="event-name">{t.events[ev.id]}</h3>
      <p className="event-blurb">{t.eventBlurbs[ev.id]}</p>
      <dl className="event-meta">
        <div><dt>🕰</dt><dd>{time}</dd></div>
        <div><dt>📍</dt><dd><strong>{v.name}</strong><br />{v.address}</dd></div>
        {ev.dressCode && <div><dt>👗</dt><dd>{t.dressCode}: {ev.dressCode[lang] || ev.dressCode.en}</dd></div>}
      </dl>
      <div className="event-actions">
        <a className="chip" href={mapsLink(v)} target="_blank" rel="noreferrer">🧭 {t.directions}</a>
        <CalendarMenu ev={ev} />
      </div>
    </Reveal>
  );
}

export default function Events({ events }) {
  const { t } = useLang();
  // group by local calendar day
  const days = [];
  for (const ev of events) {
    const v = venues[ev.venue];
    const key = fmtDate(ev.start, 'en-CA', v.timeZone, { weekday: undefined, year: 'numeric', month: '2-digit', day: '2-digit' });
    let day = days.find((d) => d.key === key);
    if (!day) days.push((day = { key, ev0: ev, items: [] }));
    day.items.push(ev);
  }
  return (
    <section className="paper events" id="events">
      <h2 className="section-title">{t.eventsTitle}</h2>
      <p className="section-sub">{t.eventsSubtitle}</p>
      <div className="days">
        {days.map((d) => {
          const v = venues[d.ev0.venue];
          return (
            <div className="day" key={d.key}>
              <div className="day-head">
                <span className="day-date">{fmtDate(d.ev0.start, t.locale, v.timeZone)}</span>
                <span className="day-place">{v.address.split(',').slice(-2).join(',').trim()}</span>
              </div>
              <div className="day-cards">
                {d.items.map((ev) => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
