import { useLang } from '../i18n/index.jsx';
import { gallery } from '../config/wedding.js';
import Reveal from './Reveal.jsx';

export default function Gallery() {
  const { t } = useLang();
  if (!gallery.length) return null;
  return (
    <section className="paper gallery" id="gallery">
      <h2 className="section-title">{t.galleryTitle}</h2>
      <div className="gallery-grid">
        {gallery.map((g) => (
          <Reveal className="gallery-item" key={g.src}>
            <img src={g.src} alt={g.alt || ''} loading="lazy" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
