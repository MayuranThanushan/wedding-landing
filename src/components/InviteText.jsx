import { useLang } from '../i18n/index.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import Reveal from './Reveal.jsx';

/** "Mr. A & Mrs. B" → two lines so names never break mid-way on phones. */
function Parents({ text, delay }) {
  const [a, b] = text.split(/\s+[&–]\s+/);
  return (
    <Reveal as="p" className="iv-parents" delay={delay}>
      <span>{a}</span>
      {b && <><span className="iv-parents-amp">&amp;</span><span>{b}</span></>}
    </Reveal>
  );
}

/** The formal invitation wording, set like a letterpress card. */
export default function InviteText() {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const i = t.invite;
  return (
    <section className="sec tone-cream iv" id="invitation">
      <div className="iv-card">
        <span className="iv-corner tl" aria-hidden="true" /><span className="iv-corner tr" aria-hidden="true" />
        <span className="iv-corner bl" aria-hidden="true" /><span className="iv-corner br" aria-hidden="true" />
        <p className="sec-kicker iv-kicker"><span className="num">02</span>{s.nav.invitation}</p>
        <img className="iv-ganesha" src="/assets/art/ganesha-pink.webp" alt="Lord Ganesha" />
        <Reveal as="p" className="iv-invocation">{t.invocation}</Reveal>
        <Reveal as="p" className="iv-blessing" delay={0.1}>{i.blessing}</Reveal>
        <Parents text={i.groomParents} delay={0.15} />
        <Reveal as="p" className="iv-and" delay={0.2}>{i.and}</Reveal>
        <Parents text={i.brideParents} delay={0.25} />
        <Reveal as="p" className="iv-request" delay={0.3}>{i.request}</Reveal>
        <Reveal className="iv-couple" variant="scale" delay={0.35}>
          <span>{i.groom}</span>
          <span className="iv-weds">&amp;</span>
          <span>{i.bride}</span>
        </Reveal>
        <hr className="rule-gold" />
        <Reveal as="p" className="iv-closing" delay={0.1}>{i.closing}</Reveal>
        <img className="iv-lotus" src="/assets/art/lotus.webp" alt="" />
      </div>
    </section>
  );
}
