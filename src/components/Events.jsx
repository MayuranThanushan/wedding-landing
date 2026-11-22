import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import { mainEventId, venues } from '../config/wedding.js';
import { eventWhen, fmtDate, mapsLink } from '../lib/format.js';
import { googleCalUrl, downloadIcs } from '../lib/calendar.js';
import Reveal from './Reveal.jsx';
import Section from './ui/Section.jsx';
import { Diya } from './ui/Ornaments.jsx';
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
      <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>📅 {t.addToCalendar}</button>
      {open && (
        <div className="cal-pop">
          <a href={googleCalUrl(ev, t)} target="_blank" rel="noreferrer">{t.googleCalendar}</a>
          <button onClick={() => { downloadIcs([ev], t, `${ev.id}.ics`); setOpen(false); }}>{t.appleCalendar}</button>
        </div>
      )}
    </div>
  );
}

/** The reception: the one event guests are invited to, shown big. */
function Spotlight({ ev, live }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const v = venues[ev.venue];
  const { time } = eventWhen(ev, t);
  const d = (o) => fmtDate(ev.start, t.locale, v.timeZone, { weekday: undefined, year: undefined, month: undefined, day: undefined, ...o });
  return (
    <Reveal className={`spot ${live ? 'is-live' : ''}`} variant="scale">
      <div className="spot-date">
        <span className="spot-day">{d({ weekday: 'long' })}</span>
        <span className="spot-num">{d({ day: 'numeric' })}</span>
        <span className="spot-month">{d({ month: 'long', year: 'numeric' })}</span>
        <div className="spot-diyas" aria-hidden="true"><Diya delay={0} /><Diya delay={0.5} /><Diya delay={0.25} /></div>
      </div>
      <div className="spot-body">
        <p className="spot-badge">✦ {s.youreInvited}</p>
        <h3 className="spot-name">{t.events[ev.id]}</h3>
        <p className="spot-blurb">{t.eventBlurbs[ev.id]}</p>
        <dl className="spot-meta">
          <div><dt>◷</dt><dd>{time}</dd></div>
          <div><dt>⌖</dt><dd><strong>{v.name}</strong><span>{v.address}</span></dd></div>
          {ev.dressCode && <div><dt>✦</dt><dd>{t.dressCode}: {ev.dressCode[lang] || ev.dressCode.en}</dd></div>}
        </dl>
        <div className="spot-actions">
          <a className="btn btn-pink" href="#rsvp">{s.rsvpCta}</a>
          <CalendarMenu ev={ev} />
          <a className="btn btn-ghost" href={mapsLink(v)} target="_blank" rel="noreferrer">↗ {t.directions}</a>
        </div>
      </div>
    </Reveal>
  );
}

/** Close-family ceremonies in Ballari: information only (no RSVP, no calendar). */
function FamilyStrip({ events }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  if (!events.length) return null;
  return (
    <div className="fam">
      <Reveal className="fam-head">
        <p className="fam-kicker">{s.familyKicker}</p>
        <p className="fam-text">{s.familyText}</p>
      </Reveal>
      <ol className="fam-list">
        {events.map((ev, i) => {
          const v = venues[ev.venue];
          return (
            <Reveal as="li" key={ev.id} className={`fam-item ${ev.id === 'wedding' ? 'is-wedding' : ''}`} delay={i * 0.06}>
              <span className="fam-icon" aria-hidden="true">{ev.icon}</span>
              <span className="fam-name">{t.events[ev.id]}</span>
              <span className="fam-when">{fmtDate(ev.start, t.locale, v.timeZone, { weekday: 'short', year: undefined, month: 'short' })} · {t.parts[ev.part]}</span>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}

export default function Events({ events }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const live = useLiveState(events);
  const main = events.find((e) => e.id === mainEventId);
  const others = events.filter((e) => e.id !== mainEventId);
  return (
    <Section id="events" tone="pink" num="02" kicker={t.eventsTitle} motif
      title={<>{s.eventsTitle[0]} <em>{s.eventsTitle[1]}</em></>} lead={s.eventsLead}>
      {main && <Spotlight ev={main} live={live?.current?.id === main.id} />}
      <FamilyStrip events={others} />
    </Section>
  );
}
