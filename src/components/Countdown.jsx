import { useEffect, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { eventById, mainEventId } from '../config/wedding.js';

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export default function Countdown() {
  const { t } = useLang();
  const target = new Date(eventById[mainEventId].start).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const left = target - now;
  const p = parts(left);
  return (
    <section className="countdown">
      <h2 className="section-title light">{left > 0 ? t.countdownTitle : t.married}</h2>
      {left > 0 && (
        <div className="countdown-grid" role="timer">
          {Object.entries(p).map(([k, v]) => (
            <div className="countdown-cell" key={k}>
              <span className="countdown-value">{String(v).padStart(2, '0')}</span>
              <span className="countdown-label">{t.units[k]}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
