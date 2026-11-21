import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { SHELL } from '../../i18n/shell.js';
import { eventById, mainEventId } from '../../config/wedding.js';
import { Thoranam } from '../ui/Ornaments.jsx';

const ART = '/assets/art';

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return { left: s, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), sec: s % 60 };
}

/** Writes scroll progress through the hero into --p (0→1) for parallax. */
function useHeroScroll(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight || 1)));
        el.style.setProperty('--p', p.toFixed(3));
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); };
  }, [ref]);
}

export default function Hero({ familyName, showRsvp }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const ref = useRef(null);
  useHeroScroll(ref);
  const c = useCountdown(new Date(eventById[mainEventId].start).getTime());
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <Thoranam className="hero-thoranam" count={23} />

      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker">
            <img src={`${ART}/ganesha-gold.webp`} alt="" width="28" height="28" />
            {familyName ? s.heroDear(familyName) : s.heroKicker}
          </p>
          <h1 className="hero-names" aria-label="Rohit & Gayathiri">
            <span className="split-line"><span style={{ '--d': '.15s' }}>Rohit</span></span>
            <span className="split-line hero-amp"><span style={{ '--d': '.35s' }}>&amp;</span></span>
            <span className="split-line"><span style={{ '--d': '.5s' }}>Gayathiri</span></span>
          </h1>
          <p className="hero-invite">{s.heroInvite}</p>

          <div className="hero-date">
            <span className="hero-date-num">14</span>
            <span className="hero-date-rest">
              <b>{new Intl.DateTimeFormat(t.locale, { month: 'long', year: 'numeric' }).format(new Date('2027-02-14T12:00:00+05:30'))}</b>
              <small>{s.places}</small>
            </span>
          </div>

          <div className="hero-actions">
            {showRsvp && <a className="btn btn-gold" href="#rsvp">{s.rsvpCta}</a>}
            <a className="btn hero-ghost" href="#events">{s.seeEvents} ↓</a>
          </div>

          {c.left > 0 && (
            <div className="hero-count" role="timer" aria-label={s.countdownTo}>
              <span className="hero-count-label">{s.countdownTo}</span>
              <div className="hero-count-cells">
                {[[c.d, t.units.days], [pad(c.h), t.units.hours], [pad(c.m), t.units.minutes], [pad(c.sec), t.units.seconds]].map(([v, l]) => (
                  <span key={l}><b>{v}</b><small>{l}</small></span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-arch">
            <img className="hero-mandala" src={`${ART}/mandala-gold.webp`} alt="" />
            <img className="hero-ganesha" src={`${ART}/ganesha-gold.webp`} alt="" />
            <img className="hero-elephants" src={`${ART}/elephants-gold.webp`} alt="" />
            <span className="hero-arch-date">14 · 02 · 2027</span>
          </div>
          <img className="hero-lotus" src={`${ART}/lotus.webp`} alt="" />
        </div>
      </div>

      <img className="hero-temples" src={`${ART}/temples.webp`} alt="" />
      <a className="hero-scroll" href="#story" aria-label={t.scroll}><span /></a>
    </section>
  );
}
