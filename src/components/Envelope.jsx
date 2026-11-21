import { useEffect, useState } from 'react';
import { useLang } from '../i18n/index.jsx';

const ART = '/assets/art';

/** Closed envelope → seal breaks → flap opens → card rises → fades into the page. */
export default function Envelope({ familyName, onOpenStart, onDone }) {
  const { t } = useLang();
  const [stage, setStage] = useState('closed'); // closed | opening | rising | leaving

  useEffect(() => {
    if (stage === 'closed') return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const plan = reduce
      ? [['leaving', 50], ['done', 450]]
      : [['rising', 750], ['leaving', 1900], ['done', 2700]];
    const timers = plan.map(([s, ms]) => setTimeout(() => (s === 'done' ? onDone() : setStage(s)), ms));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage === 'closed']);

  const open = () => {
    if (stage !== 'closed') return;
    onOpenStart?.();
    setStage('opening');
  };

  return (
    <div className={`env-stage is-${stage}`} role="dialog" aria-label={t.weddingInvitation}>
      <div className="env-greeting">
        {familyName ? (
          <>
            <p className="env-dear">{t.dear}</p>
            <p className="env-family">{familyName}</p>
          </>
        ) : (
          <p className="env-family">{t.youAreInvited}</p>
        )}
      </div>

      <button className="env" onClick={open} aria-label={t.tapToOpen}>
        <span className="env-back" />
        <span className="env-card">
          <img src={`${ART}/ganesha-gold.webp`} alt="" className="env-card-ganesha" />
          <span className="env-card-title">{t.weddingInvitation}</span>
          <span className="env-card-names">Rohit &amp; Gayathiri</span>
          <span className="env-card-date">14 . 02 . 2027</span>
        </span>
        <svg className="env-pocket" viewBox="0 0 400 280" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="gold-line" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#fff1a8" />
              <stop offset=".45" stopColor="#e2b545" />
              <stop offset="1" stopColor="#b8862b" />
            </linearGradient>
          </defs>
          <path d="M0 0 L200 150 L400 0 V280 H0 Z" fill="#b8006f" />
          <path d="M0 280 L178 128 M400 280 L222 128" stroke="url(#gold-line)" strokeWidth="1.6" fill="none" />
          <path d="M0 0 L200 150 L400 0" stroke="url(#gold-line)" strokeWidth="2" fill="none" />
        </svg>
        <span className="env-flap">
          <svg viewBox="0 0 400 175" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0 H400 L200 175 Z" fill="#c4007a" />
            <path d="M0 1 L200 174 L400 1" stroke="url(#gold-line)" strokeWidth="2.4" fill="none" />
          </svg>
        </span>
        <span className="env-seal" aria-hidden="true">
          <span className="env-seal-inner">R<i>&amp;</i>G</span>
        </span>
      </button>

      <p className="env-tap">{t.tapToOpen}</p>
      <img className="env-temples" src={`${ART}/temples.webp`} alt="" />
    </div>
  );
}
