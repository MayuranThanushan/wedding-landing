import { useLang } from '../i18n/index.jsx';

const ART = '/assets/art';

/** Page 1 of the printed card, rebuilt in HTML. */
export default function Cover() {
  const { t } = useLang();
  return (
    <section className="cover" id="top">
      <div className="cover-pattern" aria-hidden="true" />
      <img className="cover-ganesha" src={`${ART}/ganesha-gold.webp`} alt="Lord Ganesha" />
      <h1 className="cover-title">{t.weddingInvitation}</h1>
      <div className="cover-frame">
        <span className="gold-bar" aria-hidden="true" />
        <div className="cover-center">
          <img className="cover-mandala" src={`${ART}/mandala-gold.webp`} alt="" />
          <img className="cover-elephants" src={`${ART}/elephants-gold.webp`} alt="Two decorated elephants" />
          <p className="cover-names">
            <span>Rohit</span> <span className="amp">&amp;</span> <span>Gayathiri</span>
          </p>
          <p className="cover-date">14 . 02 . 2027</p>
        </div>
        <span className="gold-bar" aria-hidden="true" />
      </div>
      <img className="cover-temples" src={`${ART}/temples.webp`} alt="" />
      <a className="cover-scroll" href="#invitation" aria-label={t.scroll}>
        <span />
      </a>
    </section>
  );
}
