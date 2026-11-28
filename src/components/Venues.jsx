import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import { eventById, mainEventId, venues } from '../config/wedding.js';
import { fmtDate, mapsEmbed, mapsLink } from '../lib/format.js';
import Reveal from './Reveal.jsx';
import Section from './ui/Section.jsx';

const directionsLink = (v) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v.mapQuery)}`;

/** Live Google map that loads as soon as it scrolls near the screen. */
function VenueMap({ v }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="vn-map" ref={ref}>
      {on
        ? <iframe title={`Map · ${v.name}`} src={mapsEmbed(v)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        : <div className="vn-map-skeleton" aria-hidden="true" />}
      <a className="vn-map-open" href={mapsLink(v)} target="_blank" rel="noreferrer">⤢ Google Maps</a>
    </div>
  );
}

export default function Venues({ events }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const [copied, setCopied] = useState('');
  const mainVenue = eventById[mainEventId]?.venue;
  const ids = [mainVenue]; // only the reception venue is shown
  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 1800); } catch { /* ignore */ }
  };

  return (
    <Section id="venues" tone="blush" num="02" kicker={s.nav.venues}
      title={<>{s.venuesTitle[0]} <em>{s.venuesTitle[1]}</em></>}>
      <div className="vn-list">
        {ids.map((id, i) => {
          const v = venues[id];
          const evs = events.filter((e) => e.venue === id);
          return (
            <Reveal className={`vn ${i % 2 ? 'is-flip' : ''}`} key={id} delay={0.05}>
              <figure className="vn-photo">
                {v.photo
                  ? <img src={v.photo} alt={v.photoCaption || v.name} loading="lazy" />
                  : <img className="vn-photo-art" src="/assets/art/temples.webp" alt="" />}
                <figcaption>
                  <span className="vn-city">{v.address.split(',').slice(-2).join(',').trim()}</span>
                  <strong className="vn-name">{v.hall || v.name}</strong>
                  {v.hall && <span className="vn-cap">{v.name}</span>}
                  
                </figcaption>
                {v.photoCredit && <small className="vn-credit">{v.photoCredit}</small>}
              </figure>

              <div className="vn-side">
                <VenueMap v={v} />
                <div className="vn-info">
                  <p className="vn-addr"><span aria-hidden="true">⌖</span> {v.address}</p>
                  <ul className="vn-events">
                    {evs.map((e) => (
                      <li key={e.id}>
                        <span>{e.icon} {t.events[e.id]}</span>
                        <small>{fmtDate(e.start, t.locale, v.timeZone, { weekday: 'short', year: undefined, month: 'short' })}</small>
                      </li>
                    ))}
                  </ul>
                  {v.notes && <p className="vn-notes">{v.notes}</p>}
                  <div className="vn-actions">
                    <a className="btn btn-pink" href={directionsLink(v)} target="_blank" rel="noreferrer">➤ {t.directions}</a>
                    <a className="btn btn-ghost" href={mapsLink(v)} target="_blank" rel="noreferrer">{t.openInMaps} ↗</a>
                    <button className="vn-copy" onClick={() => copy(id, `${v.name}, ${v.address}`)}>{copied === id ? '✓ Copied' : '⧉ Copy address'}</button>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
