import { useLang } from '../i18n/index.jsx';
import Reveal from './Reveal.jsx';
import LotusDivider from './LotusDivider.jsx';

/** "Mr. A & Mrs. B" → two lines so names never break mid-way on phones. */
function Parents({ text }) {
  const [a, b] = text.split(/\s+[&–]\s+/);
  return (
    <p className="invite-parents">
      <span>{a}</span>
      {b && <><span className="invite-parents-amp">&amp;</span><span>{b}</span></>}
    </p>
  );
}

/** Page 2 of the printed card: the formal invitation wording. */
export default function InviteText() {
  const { t } = useLang();
  const i = t.invite;
  return (
    <section className="paper invite-text" id="invitation">
      <img className="paper-ganesha" src="/assets/art/ganesha-pink.webp" alt="Lord Ganesha" />
      <Reveal>
        <p className="invocation">{t.invocation}</p>
        <p className="invite-blessing">{i.blessing}</p>
        <Parents text={i.groomParents} />
        <p className="invite-and">{i.and}</p>
        <Parents text={i.brideParents} />
        <p className="invite-request">{i.request}</p>
        <p className="invite-couple">
          <span>{i.groom}</span>
          <span className="invite-weds">&amp;</span>
          <span>{i.bride}</span>
        </p>
        <p className="invite-closing">{i.closing}</p>
      </Reveal>
      <LotusDivider />
    </section>
  );
}
