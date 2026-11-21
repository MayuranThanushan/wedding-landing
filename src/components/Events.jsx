import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import { venues } from '../config/wedding.js';
import { eventWhen, fmtDate, mapsLink } from '../lib/format.js';
import { googleCalUrl, downloadIcs } from '../lib/calendar.js';
import Reveal from './Reveal.jsx';
import Section from './ui/Section.jsx';
import { useLiveState } from './shell/LiveNow.jsx';

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
      <button className="ev-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>＋ {t.addToCalendar}</button>
      {open && (
        <div className="cal-pop">
          <a href={googleCalUrl(ev, t)} target="_blank" rel="noreferrer">{t.googleCalendar}</a>
          <button onClick={() => { downloadIcs([ev], t, `${ev.id}.ics`); setOpen(false); }}>{t.appleCalendar}</button>
        </div>
      )}
    </div>
  );
}

export function EventCard({ ev, i = 0, live }) {
  const { t, lang } = useLang();
  const v = venues[ev.venue];
  const { time } = eventWhen(ev, t);
  return (
    <Reveal as="article" delay={i * 0.08} className={`ev ${ev.featured ? 'is-featured' : ''} ${live ? 'is-live' : ''}`}>
      <div className="ev-top">
        <span className="ev-icon" aria-hidden="true">{ev.icon}</span>
        <span className="ev-part">{t.parts[ev.part]}</span>
        {live && <span className="ev-live">● LIVE</span>}
      </div>
      <h3 className="ev-name">{t.events[ev.id]}</h3>
      <p className="ev-blurb">{t.eventBlurbs[ev.id]}</p>
      <dl className="ev-meta">
        <div><dt>{t.parts[ev.part] ? '◷' : ''}</dt><dd>{time}</dd></div>
        <div><dt>⌖</dt><dd><strong>{v.name}</strong><span>{v.address}</span></dd></div>
        {ev.dressCode && <div><dt>✦</dt><dd>{t.dressCode}: {ev.dressCode[lang] || ev.dressCode.en}</dd></div>}
      </dl>
      <div className="ev-actions">
        <a className="ev-link" href={mapsLink(v)} target="_blank" rel="noreferrer">↗ {t.directions}</a>
        <CalendarMenu ev={ev} />
      </div>
    </Reveal>
  );
}

export default function Events({ events }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const live = useLiveState(events);
  const days = [];
  for (const ev of events) {
    const v = venues[ev.venue];
    const key = fmtDate(ev.start, 'en-CA', v.timeZone, { weekday: undefined, year: 'numeric', month: '2-digit', day: '2-digit' });
    let day = days.find((d) => d.key === key);
    if (!day) days.push((day = { key, ev0: ev, tz: v.timeZone, items: [] }));
    day.items.push(ev);
  }
  const part = (d, opts) => fmtDate(d.ev0.start, t.locale, d.tz, { weekday: undefined, year: undefined, month: undefined, day: undefined, ...opts });

  return (
    <Section id="events" tone="pink" num="03" kicker={t.eventsTitle} motif
      title={<>{s.eventsTitle[0]} <em>{s.eventsTitle[1]}</em></>} lead={s.eventsLead}>
      <nav className="rail" aria-label={t.eventsTitle}>
        {days.map((d, i) => (
          <a key={d.key} href={`#day-${d.key}`} className="rail-stop">
            <span className="rail-dot" />
            <span className="rail-day">{s.dayLabel} {i + 1}</span>
            <span className="rail-date">{part(d, { day: 'numeric', month: 'short' })}</span>
          </a>
        ))}
      </nav>

      <div className="days">
        {days.map((d, i) => {
          const v = venues[d.ev0.venue];
          return (
            <div className="day" id={`day-${d.key}`} key={d.key}>
              <Reveal variant="left" className="day-side">
                <span className="day-n">{s.dayLabel} {String(i + 1).padStart(2, '0')}</span>
                <span className="day-num">{part(d, { day: 'numeric' })}</span>
                <span className="day-month">{part(d, { weekday: 'long' })} · {part(d, { month: 'long' })}</span>
                <span className="day-place">{v.address.split(',').slice(-2).join(',').trim()}</span>
              </Reveal>
              <div className="day-cards">
                {d.items.map((ev, j) => <EventCard key={ev.id} ev={ev} i={j} live={live?.current?.id === ev.id} />)}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
