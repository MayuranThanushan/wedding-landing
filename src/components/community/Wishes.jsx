import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { COMMUNITY, errText, relTime } from '../../i18n/community.js';
import { listWishes, postWish } from '../../lib/api.js';
import Section from '../ui/Section.jsx';
import Reveal from '../Reveal.jsx';
import '../../styles/community.css';

const MAX = 600;
const VARIANTS = ['paper', 'gold', 'blush'];
// stable pseudo-random tilt per wish id
const tilt = (id = '') => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.55;
};
const excerpt = (m) => (m.length > 70 ? `${m.slice(0, 68).trimEnd()}…` : m);

export default function Wishes({ code, invite }) {
  const { lang, t } = useLang();
  const s = dict(COMMUNITY, lang);
  const [wishes, setWishes] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState('idle'); // idle | busy | done
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    listWishes().then((w) => alive && setWishes(w || [])).catch(() => {});
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const n = invite?.rsvp?.name || invite?.family_name;
    if (n) setName((cur) => cur || n);
  }, [invite]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) { setError(s.errName); return; }
    setState('busy'); setError('');
    try {
      await postWish(code, { name: name.trim(), message: message.trim() });
      setMessage(''); setState('done');
    } catch (err) { setError(errText(s, err)); setState('idle'); }
  };

  const strip = useMemo(() => wishes.slice(0, 12), [wishes]);

  return (
    <Section
      id="wishes" tone="pink" num="08" motif
      kicker={s.wishesKicker}
      title={<>{s.wishesTitle[0]}<em>{s.wishesTitle[1]}</em></>}
      lead={s.wishesLead}
    >
      {strip.length >= 3 && (
        <div className="cm-marquee" aria-hidden="true">
          <div className="cm-marquee-track">
            {[...strip, ...strip].map((w, i) => (
              <span key={`${w.id}-${i}`} className="cm-marquee-item">
                <span className="diamond" /> “{excerpt(w.message)}” <b>— {w.name}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="cm-wishes-layout">
        <Reveal variant="left" className="cm-composer card">
          {!code ? (
            <p className="cm-needlink">✉️ {s.needLink}</p>
          ) : state === 'done' ? (
            <div className="cm-thanks" role="status">
              <span className="cm-thanks-icon" aria-hidden="true">🪷</span>
              <p>{s.wishThanks}</p>
              <button type="button" className="btn btn-gold" onClick={() => setState('idle')}>{s.wishAnother}</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label className="label">
                {s.yourName}
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />
              </label>
              <label className="label">
                {s.wishLabel}
                <textarea
                  className="textarea" value={message} maxLength={MAX} required rows={5}
                  placeholder={s.wishPlaceholder} onChange={(e) => setMessage(e.target.value)}
                />
                <span className={`cm-counter ${message.length > MAX - 40 ? 'warn' : ''}`} aria-live="polite">{message.length}/{MAX}</span>
              </label>
              {error && <p className="cm-error" role="alert">{error}</p>}
              <button className="btn btn-gold btn-block" disabled={state === 'busy'}>
                {state === 'busy' ? s.sending : s.wishSend}
              </button>
            </form>
          )}
        </Reveal>

        <div className="cm-wall" aria-live="polite">
          {wishes.length === 0 ? (
            <Reveal className="cm-wall-empty">
              <span aria-hidden="true">❝</span>
              <p>{s.wishesEmpty}</p>
            </Reveal>
          ) : wishes.map((w, i) => (
            <Reveal
              key={w.id} as="figure" variant="scale" delay={Math.min(i, 8) * 0.07}
              className={`cm-wish v-${VARIANTS[i % VARIANTS.length]}`}
              style={{ '--tilt': `${tilt(w.id)}deg` }}
            >
              <span className="cm-wish-quote" aria-hidden="true">“</span>
              <blockquote>{w.message}</blockquote>
              <figcaption>
                <span className="cm-wish-name">{w.name}</span>
                <span className="cm-wish-date">{relTime(w.created_at, t.locale, s)}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
