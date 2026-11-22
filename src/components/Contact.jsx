import { useLang } from '../i18n/index.jsx';
import { dict, pick } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import { contacts } from '../config/wedding.js';
import Reveal from './Reveal.jsx';

export default function Contact({ sections = [] }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  return (
    <footer className="ft" id="contact">
      <div className="ft-inner">
        <Reveal className="ft-head">
          <p className="sec-kicker">{t.contactTitle}</p>
          <h2 className="ft-title">{s.footerTitle[0]} <em>{s.footerTitle[1]}</em></h2>
        </Reveal>

        <div className="ft-grid">
          {contacts.map((c, i) => (
            <Reveal className="ft-card" key={c.name} delay={i * 0.1}>
              {c.role && <p className="ft-role">{pick(c.role, lang)}</p>}
              <h3>{c.name}</h3>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`}>☏ {c.phone}</a>
              <a href={`https://wa.me/${c.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer">✆ WhatsApp</a>
              {c.email && <a href={`mailto:${c.email}`}>✉ {c.email}</a>}
            </Reveal>
          ))}
          {sections.length > 0 && (
            <Reveal className="ft-nav" delay={0.2}>
              <h3>{s.footerNav}</h3>
              <ul>{sections.filter((id) => s.nav[id]).map((id) => <li key={id}><a href={`#${id}`}>{s.nav[id]}</a></li>)}</ul>
            </Reveal>
          )}
        </div>

        <div className="ft-sign">
          <p>{s.footerLine}</p>
          <p className="ft-script">Rohit Reddy &amp; Gayathiri</p>
          <a className="ft-top" href="#top">↑ {s.backTop}</a>
        </div>
      </div>
      <img className="ft-temples" src="/assets/art/temples.webp" alt="" />
      <p className="ft-made">{s.madeWith} · <a href="/engagement/">Engagement 2025</a></p>
    </footer>
  );
}
