import { useEffect, useRef } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { pick } from '../../i18n/pick.js';
import { story } from '../../config/content.js';
import Section from '../ui/Section.jsx';
import Reveal from '../Reveal.jsx';
import '../../styles/sections.css';

/** Sets --p (0..1) on the element as it scrolls through the viewport, so the gold line "draws". */
function useScrollProgress(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [ref]);
}

export default function Story() {
  const { lang } = useLang();
  const line = useRef(null);
  useScrollProgress(line);
  const [t1, t2] = pick(story.title, lang);

  return (
    <Section
      id="story" tone="blush" num="01" motif
      kicker={pick(story.kicker, lang)}
      title={<>{t1} <em>{t2}</em></>}
      lead={pick(story.lead, lang)}
    >
      <ol className="story-line" ref={line}>
        <span className="story-track" aria-hidden="true"><span className="story-fill" /></span>
        {story.milestones.map((m, i) => (
          <li key={i} className={`story-item ${i % 2 ? 'is-right' : 'is-left'} ${m.final ? 'is-final' : ''}`}>
            <span className="story-dot" aria-hidden="true">{m.icon}</span>
            <Reveal variant={i % 2 ? 'right' : 'left'} className="story-card card lift">
              {m.photo && <img className="story-photo" src={m.photo} alt="" loading="lazy" />}
              <p className="card-eyebrow">{pick(m.when, lang)}</p>
              <h3 className="card-title">{pick(m.title, lang)}</h3>
              <p className="story-text">{pick(m.text, lang)}</p>
              {m.link && (
                <a className="story-link" href={m.link}>
                  {pick(story.engagementLink, lang)} <span aria-hidden="true">→</span>
                </a>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
