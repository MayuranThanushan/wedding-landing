import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { SHELL } from '../../i18n/shell.js';
import { eventById, mainEventId, venues } from '../../config/wedding.js';
import { eventWhen, fmtDate } from '../../lib/format.js';

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return { left: s, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60) };
}

/** Full-bleed engagement photo with the invitation words laid over it. */
export default function Hero({ familyName, showRsvp }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const ev = eventById[mainEventId];
  const v = venues[ev.venue];
  const c = useCountdown(new Date(ev.start).getTime());
  const day = (o) => fmtDate(ev.start, t.locale, v.timeZone, { weekday: undefined, day: undefined, month: undefined, year: undefined, ...o });

  return (
    <section className="hero" id="top">
      <picture className="hero-photo">
        <source media="(max-width: 700px)" srcSet="/assets/photos/hero-sm.webp" />
        <img src="/assets/photos/hero.webp" alt="Rohit Reddy and Gayathiri" fetchpriority="high" />
      </picture>
      <div className="hero-veil" aria-hidden="true" />

      <div className="hero-top">
        <p className="hero-kicker">{familyName ? s.heroDear(familyName) : s.heroKicker}</p>
      </div>

      <div className="hero-bottom">
        <h1 className="hero-names">
          <span>Rohit Reddy</span>
          <span className="hero-amp">&amp;</span>
          <span>Gayathiri</span>
        </h1>
        <p className="hero-invite">{s.heroInvite}</p>
        <p className="hero-when">
          <span className="nowrap">{day({ weekday: 'long' })}, {day({ day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="hero-dot" aria-hidden="true">·</span>
          <span className="nowrap">{eventWhen(ev, t).time}</span>
        </p>
        <p className="hero-where">{v.hall} · {v.name}</p>
        <div className="hero-actions">
          {showRsvp && <a className="btn btn-pink" href="#rsvp">{s.rsvpCta}</a>}
          <a className="btn btn-ghost" href="#invitation">{s.seeInvite}</a>
        </div>
        {c.left > 0 && (
          <p className="hero-count" role="timer">
            <b>{c.d}</b> {t.units.days} · <b>{c.h}</b> {t.units.hours} · <b>{c.m}</b> {t.units.minutes}
          </p>
        )}
      </div>
    </section>
  );
}
