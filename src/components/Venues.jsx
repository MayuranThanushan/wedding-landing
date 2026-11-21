import { useLang } from '../i18n/index.jsx';
import { venues } from '../config/wedding.js';
import { mapsEmbed, mapsLink } from '../lib/format.js';
import Reveal from './Reveal.jsx';

export default function Venues({ events }) {
  const { t } = useLang();
  const ids = [...new Set(events.map((e) => e.venue))];
  return (
    <section className="venues" id="venues">
      <h2 className="section-title light">{t.venuesTitle}</h2>
      <div className="venue-grid">
        {ids.map((id) => {
          const v = venues[id];
          const names = events.filter((e) => e.venue === id).map((e) => t.events[e.id]).join(' · ');
          return (
            <Reveal className="venue" key={id}>
              <div className="venue-map">
                <iframe title={v.name} src={mapsEmbed(v)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <div className="venue-body">
                <h3>{v.name}</h3>
                <p>{v.address}</p>
                <p className="venue-events">{names}</p>
                {v.notes && <p className="venue-notes">{v.notes}</p>}
                <a className="btn btn-gold" href={mapsLink(v)} target="_blank" rel="noreferrer">{t.openInMaps}</a>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
