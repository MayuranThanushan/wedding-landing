import { useLang } from '../i18n/index.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';
import Reveal from './Reveal.jsx';
import { Diya, Kalasam, KolamCorner, Thoranam } from './ui/Ornaments.jsx';

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

/**
 * The formal invitation, styled like a traditional Telugu–Tamil wedding card:
 * mango-leaf thoranam, purna kumbham kalasams, kolam corners, diyas and the classic
 * "Srirastu · Shubhamastu · Avighnamastu" / "Subha Muhurtha Pathirikai" headers.
 */
export default function InviteText() {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang);
  const i = t.invite;
  return (
    <section className="sec tone-cream iv" id="invitation">
      <p className="sec-kicker iv-kicker"><span className="num">01</span>{s.nav.invitation}</p>
      <div className="iv-card">
        <Thoranam className="iv-thoranam" />
        <div className="iv-frame">
          <KolamCorner className="iv-kolam tl" /><KolamCorner className="iv-kolam tr" />
          <KolamCorner className="iv-kolam bl" /><KolamCorner className="iv-kolam br" />

          <p className="iv-srirastu" lang="te">శ్రీరస్తు · శుభమస్తు · అవిఘ్నమస్తు</p>
          <div className="iv-top">
            <Kalasam className="iv-kalasam" />
            <img className="iv-ganesha" src="/assets/art/ganesha-pink.webp" alt="Lord Ganesha" />
            <Kalasam className="iv-kalasam flip" />
          </div>
          <p className="iv-pathirikai" lang="ta">சுப முகூர்த்தப் பத்திரிகை</p>
          <Reveal as="p" className="iv-invocation">{t.invocation}</Reveal>
          <Reveal as="p" className="iv-blessing" delay={0.1}>{i.blessing}</Reveal>
          <Parents text={i.groomParents} delay={0.15} />
          <Reveal as="p" className="iv-and" delay={0.2}>{i.and}</Reveal>
          <Parents text={i.brideParents} delay={0.25} />
          <Reveal as="p" className="iv-request" delay={0.3}>{i.request}</Reveal>
          <Reveal className="iv-couple" variant="scale" delay={0.35}>
            <span>{i.groom}</span>
            <span className="iv-weds">{lang === 'en' ? 'weds' : '&'}</span>
            <span>{i.bride}</span>
          </Reveal>
          <div className="iv-muhurtham">
            <span>{t.events['reception-colombo'].split(/\s+[—-]\s+/)[0]}</span>
            <strong>20 · 02 · 2027</strong>
            <span>Ramada Colombo</span>
          </div>
          <Reveal as="p" className="iv-closing" delay={0.1}>{i.closing}</Reveal>
          <div className="iv-diyas">
            {[0, 0.4, 0.8, 0.2, 0.6].map((d, k) => <Diya key={k} delay={d} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
