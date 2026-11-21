import { useLang } from '../../i18n/index.jsx';
import { pick } from '../../i18n/pick.js';
import { faq } from '../../config/content.js';
import { rsvpBy } from '../../config/wedding.js';
import Section from '../ui/Section.jsx';
import Reveal from '../Reveal.jsx';
import '../../styles/sections.css';

export default function Faq() {
  const { lang, t } = useLang();
  const date = rsvpBy
    ? new Intl.DateTimeFormat(t?.locale || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${rsvpBy}T12:00:00`))
    : '';
  const items = faq.items.filter((it) => rsvpBy || !pick(it.a, 'en').includes('{rsvpBy}'));
  const [t1, t2] = pick(faq.title, lang);

  return (
    <Section id="faq" tone="blush" num="08" className="faq">
      <div className="faq-layout">
        <Reveal className="sec-head faq-head">
          <p className="sec-kicker"><span className="num">08</span>{pick(faq.kicker, lang)}</p>
          <h2 className="sec-title">{t1} <em>{t2}</em></h2>
          <p className="sec-lead">{pick(faq.lead, lang)}</p>
          <a className="btn btn-pink faq-cta" href="#contact">{pick(faq.contactCta, lang)}</a>
        </Reveal>
        <div className="acc faq-list">
          {items.map((it, i) => (
            <Reveal key={i} delay={Math.min(i, 6) * 0.04}>
              <details>
                <summary>{pick(it.q, lang)}</summary>
                <div className="acc-body">{pick(it.a, lang).replace('{rsvpBy}', date)}</div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
