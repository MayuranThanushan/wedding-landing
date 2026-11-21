import { useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import { venues } from '../config/wedding.js';
import { mapsEmbed, mapsLink } from '../lib/format.js';
import Reveal from './Reveal.jsx';
import Section from './ui/Section.jsx';

/** Map loads only on tap — keeps the page fast and avoids Google cookies until needed. */
function LazyMap({ v }) {
  const [on, setOn] = useState(false);
  return (
    <div className="vn-map">
      {on
        ? <iframe title={v.name} src={mapsEmbed(v)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        : (
          <button className="vn-map-cover" onClick={() => setOn(true)}>
            <img src="/assets/art/temples.webp" alt="" />
            <span>⌖ Show map</span>
          </button>
        )}
    </div>
  );
}

export default function Venues({ events }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const ids = [...new Set(events.map((e) => e.venue))];
  return (
    <Section id="venues" tone="blush" num="05" kicker={t.venuesTitle}
      title={<>{s.venuesTitle[0]} <em>{s.venuesTitle[1]}</em></>} lead={s.venuesLead}>
      <div className="vn-grid">
        {ids.map((id, i) => {
          const v = venues[id];
          const evs = events.filter((e) => e.venue === id);
          return (
            <Reveal className="vn" key={id} delay={i * 0.1}>
              <LazyMap v={v} />
              <div className="vn-body">
                <p className="card-eyebrow">{v.address.split(',').slice(-1)[0].trim()}</p>
                <h3 className="vn-name">{v.name}</h3>
                <p className="vn-addr">{v.address}</p>
                <ul className="vn-events">
                  {evs.map((e) => <li key={e.id}>{e.icon} {t.events[e.id]}</li>)}
                </ul>
                {v.notes && <p className="vn-notes">{v.notes}</p>}
                <a className="btn btn-pink" href={mapsLink(v)} target="_blank" rel="noreferrer">{t.openInMaps} ↗</a>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
