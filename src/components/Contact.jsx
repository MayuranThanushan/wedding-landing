import { useLang } from '../i18n/index.jsx';
import { contacts } from '../config/wedding.js';

export default function Contact() {
  const { t } = useLang();
  return (
    <footer className="contact" id="contact">
      <img className="contact-ganesha" src="/assets/art/ganesha-gold.webp" alt="" />
      <h2 className="section-title light">{t.contactTitle}</h2>
      <div className="contact-grid">
        {contacts.map((c) => (
          <div className="contact-card" key={c.name}>
            <h3>{c.name}</h3>
            <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
            <a href={`https://wa.me/${c.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href={`mailto:${c.email}`}>{c.email}</a>
          </div>
        ))}
      </div>
      <p className="contact-footer">{t.footer}</p>
      <img className="contact-temples" src="/assets/art/temples.webp" alt="" />
    </footer>
  );
}
