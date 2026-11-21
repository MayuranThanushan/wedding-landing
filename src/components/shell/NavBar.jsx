import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { LANGS } from '../../i18n/strings.js';
import { dict } from '../../i18n/pick.js';
import { SHELL } from '../../i18n/shell.js';

function useActiveSection(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

function Langs({ className = '' }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`nav-langs ${className}`} role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.code} className={l.code === lang ? 'active' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>
          {l.code === 'en' ? 'EN' : l.label}
        </button>
      ))}
    </div>
  );
}

/** Sticky editorial nav. `sections` = ids present on the page, in order. */
export default function NavBar({ sections }) {
  const { lang } = useLang();
  const s = dict(SHELL, lang);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sections);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const links = sections.filter((id) => s.nav[id]);
  return (
    <>
      <header className={`nav ${solid ? 'is-solid' : ''}`}>
        <a className="nav-brand" href="#top" aria-label="Rohit & Gayathiri — top">
          <span className="nav-mono">R<i>&amp;</i>G</span>
          <span className="nav-date">14·02·27</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          {links.filter((id) => id !== 'rsvp').map((id) => (
            <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>{s.nav[id]}</a>
          ))}
        </nav>
        <Langs className="nav-langs-desktop" />
        {sections.includes('rsvp') && <a className="nav-cta" href="#rsvp">{s.nav.rsvp}</a>}
        <button className="nav-burger" aria-expanded={open} aria-controls="nav-menu" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">{open ? s.close : s.menu}</span>
          <i /><i />
        </button>
      </header>

      <div id="nav-menu" className={`nav-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="nav-menu-inner">
          <ol className="nav-menu-list">
            {links.map((id, i) => (
              <li key={id} style={{ '--i': i }}>
                <a href={`#${id}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>{s.nav[id]}
                </a>
              </li>
            ))}
          </ol>
          <Langs />
        </div>
      </div>
    </>
  );
}
