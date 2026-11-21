import { useLang } from '../../i18n/index.jsx';
import { pick } from '../../i18n/pick.js';
import { couple } from '../../config/content.js';
import Reveal from '../Reveal.jsx';
import '../../styles/sections.css';

/** Short "The Couple" intro: two arched portraits (monograms until photos are added) and one warm line. */
function Person({ p, side }) {
  const { lang } = useLang();
  return (
    <Reveal className={`cp-person ${side}`} variant={side === 'l' ? 'left' : 'right'}>
      <div className="cp-arch">
        {p.photo
          ? <img src={p.photo} alt={p.name} />
          : <span className="cp-mono" aria-hidden="true">{p.name[0]}</span>}
        <img className="cp-mandala" src="/assets/art/mandala-gold.webp" alt="" />
      </div>
      <p className="cp-role">{pick(p.role, lang)}</p>
      <h3 className="cp-name">{p.name}</h3>
      <p className="cp-family">{pick(p.family, lang)}</p>
    </Reveal>
  );
}

export default function Story() {
  const { lang } = useLang();
  return (
    <section id="story" className="sec tone-blush cp">
      <div className="wrap">
        <Reveal className="sec-head center">
          <p className="sec-kicker"><span className="num">01</span>{pick(couple.kicker, lang)}</p>
        </Reveal>
        <div className="cp-row">
          <Person p={couple.groom} side="l" />
          <Reveal className="cp-mid" variant="scale" delay={0.2}>
            <img src="/assets/art/lotus.webp" alt="" className="cp-lotus" />
            <span className="cp-amp">&amp;</span>
          </Reveal>
          <Person p={couple.bride} side="r" />
        </div>
        <Reveal className="cp-words" delay={0.15}>
          <p className="cp-quote">“{pick(couple.quote, lang)}”</p>
          <p className="cp-line">{pick(couple.line, lang)}</p>
        </Reveal>
      </div>
    </section>
  );
}
