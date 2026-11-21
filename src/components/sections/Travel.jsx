import { useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { pick } from '../../i18n/pick.js';
import { travel } from '../../config/content.js';
import Section from '../ui/Section.jsx';
import Reveal from '../Reveal.jsx';
import '../../styles/sections.css';

const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/**
 * Travel & Stay. Optional `events` (the guest's visible events) hides a destination
 * whose venue the guest isn't invited to; defaults to showing both.
 */
export default function Travel({ events }) {
  const { lang } = useLang();
  const venuesUsed = events?.length ? new Set(events.map((e) => e.venue)) : null;
  const dests = travel.destinations.filter((d) => !venuesUsed || venuesUsed.has(d.id));
  const [active, setActive] = useState(dests[0]?.id);
  if (!dests.length) return null;
  const d = dests.find((x) => x.id === active) || dests[0];
  const lb = travel.labels;
  const [t1, t2] = pick(travel.title, lang);

  return (
    <Section
      id="travel" tone="plum" num="06" motif
      kicker={pick(travel.kicker, lang)}
      title={<>{t1} <em>{t2}</em></>}
      lead={pick(travel.lead, lang)}
    >
      {dests.length > 1 && (
        <Reveal>
          <div className="seg trv-tabs" role="tablist" aria-label={pick(travel.kicker, lang)}>
            {dests.map((x) => (
              <button key={x.id} role="tab" aria-selected={x.id === d.id} aria-controls="trv-panel" onClick={() => setActive(x.id)}>
                {pick(x.name, lang)}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      <div className="trv-panel" id="trv-panel" role="tabpanel" key={d.id}>
        <header className="trv-head">
          <div>
            <h3 className="trv-name">{pick(d.name, lang)}</h3>
            <p className="trv-country">{pick(d.country, lang)}</p>
          </div>
          <p className="pill trv-events">{pick(d.events, lang)}</p>
          <div className="trv-weather">
            <span className="trv-temp foil-text">{d.weather.temp}</span>
            <span className="trv-weather-label">{pick(lb.weather, lang)}</span>
            <p>{pick(d.weather.text, lang)}</p>
          </div>
        </header>

        <div className="trv-grid">
          <section className="trv-col">
            <p className="sec-kicker">{pick(lb.gettingThere, lang)}</p>
            <ul className="trv-routes">
              {d.routes.map((r, i) => (
                <Reveal as="li" key={i} delay={i * 0.06} className="trv-route">
                  <span className="trv-route-icon" aria-hidden="true">{r.icon}</span>
                  <div>
                    <h4>{pick(r.title, lang)}</h4>
                    <p>{pick(r.text, lang)}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
            <div className="card trv-visa">
              <p className="card-eyebrow">🛂 {pick(lb.visa, lang)}</p>
              <p>{pick(d.visa.text, lang)}</p>
              <a className="trv-link" href={d.visa.url} target="_blank" rel="noreferrer">{pick(lb.officialSite, lang)} ↗</a>
            </div>
          </section>

          <section className="trv-col">
            <p className="sec-kicker">{pick(lb.stay, lang)}</p>
            <div className="trv-hotels">
              {d.hotels.map((h, i) => (
                <Reveal key={h.name} delay={i * 0.06}>
                  <a className={`card lift trv-hotel ${h.venue ? 'is-venue' : ''}`} href={mapUrl(h.mapQuery)} target="_blank" rel="noreferrer">
                    <span className="trv-hotel-name">{h.name}</span>
                    <span className="trv-hotel-area">{pick(h.area, lang)}</span>
                    {h.venue && <span className="pill">{pick(lb.venue, lang)}</span>}
                    <span className="trv-hotel-map" aria-hidden="true">↗</span>
                  </a>
                </Reveal>
              ))}
            </div>
            <p className="trv-note">{pick(lb.stayNote, lang)}</p>
            {d.help && <p className="trv-help"><span className="diamond" aria-hidden="true" /> {pick(d.help, lang)} <a href="#contact">→</a></p>}
          </section>
        </div>

        <div className="trv-tips">
          <p className="sec-kicker">{pick(lb.tips, lang)}</p>
          <ul className="grid-auto trv-tip-grid">
            {d.tips.map((tip, i) => (
              <Reveal as="li" key={i} delay={i * 0.05} className="trv-tip">
                <span aria-hidden="true">{tip.icon}</span>
                <p>{pick(tip.text, lang)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
