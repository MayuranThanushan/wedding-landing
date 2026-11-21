import { useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { pick } from '../../i18n/pick.js';
import { ceremonies } from '../../config/content.js';
import { events as ALL_EVENTS } from '../../config/wedding.js';
import Section from '../ui/Section.jsx';
import Reveal from '../Reveal.jsx';
import '../../styles/sections.css';

/**
 * Interactive guide to each ritual. Optional `events` (the guest's visible events)
 * limits the tabs to those; defaults to every event that has guide content.
 */
export default function Ceremonies({ events = ALL_EVENTS }) {
  const { lang } = useLang();
  const list = events.filter((e) => ceremonies.items[e.id]);
  const [active, setActive] = useState(list.find((e) => e.featured)?.id || list[0]?.id);
  if (!list.length) return null;
  const ev = list.find((e) => e.id === active) || list[0];
  const c = ceremonies.items[ev.id];
  const lb = ceremonies.labels;
  const wear = c.wear ? pick(c.wear, lang) : ev.dressCode ? pick(ev.dressCode, lang) : null;
  const [t1, t2] = pick(ceremonies.title, lang);

  return (
    <Section
      id="ceremonies" tone="cream" num="04"
      kicker={pick(ceremonies.kicker, lang)}
      title={<>{t1} <em>{t2}</em></>}
      lead={pick(ceremonies.lead, lang)}
    >
      <Reveal className="cer-tabs-wrap">
        <div className="seg cer-tabs" role="tablist" aria-label={pick(ceremonies.kicker, lang)}>
          {list.map((e) => (
            <button
              key={e.id} role="tab" id={`cer-tab-${e.id}`} aria-controls="cer-panel"
              aria-selected={e.id === ev.id} onClick={() => setActive(e.id)}
            >
              <span aria-hidden="true">{e.icon}</span> {pick(ceremonies.items[e.id].tab, lang)}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="cer-panel" id="cer-panel" role="tabpanel" aria-labelledby={`cer-tab-${ev.id}`} key={ev.id}>
        <div className="cer-hero">
          <span className="cer-icon" aria-hidden="true">{ev.icon}</span>
          <p className="card-eyebrow">{pick(c.sub, lang)}</p>
          <h3 className="cer-name">{pick(c.tab, lang)}</h3>
          <hr className="rule-gold" />
          <p className="cer-meaning-label">{pick(lb.meaning, lang)}</p>
          <p className="cer-meaning">{pick(c.meaning, lang)}</p>
        </div>
        <div className="cer-side">
          <div className="card cer-block">
            <p className="card-eyebrow">{pick(lb.expect, lang)}</p>
            <p>{pick(c.expect, lang)}</p>
          </div>
          {wear && (
            <div className="card cer-block cer-wear">
              <p className="card-eyebrow">{pick(lb.wear, lang)}</p>
              <p className="cer-wear-text"><span className="diamond" aria-hidden="true" /> {wear}</p>
            </div>
          )}
        </div>
        {c.rituals && (
          <div className="cer-rituals">
            <p className="sec-kicker">{pick(lb.rituals, lang)}</p>
            <ol className="cer-ritual-list">
              {c.rituals.map((r, i) => (
                <li key={i} className="card lift cer-ritual">
                  <span className="cer-ritual-num">{String(i + 1).padStart(2, '0')}</span>
                  <h4>{pick(r.name, lang)}</h4>
                  <p>{pick(r.text, lang)}</p>
                </li>
              ))}
            </ol>
            <p className="cer-note">{pick(lb.note, lang)}</p>
          </div>
        )}
      </div>
    </Section>
  );
}
