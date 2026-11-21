import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { SHELL } from '../../i18n/shell.js';

/** Endless gold ribbon of celebration names. */
export default function Marquee() {
  const { lang } = useLang();
  const words = dict(SHELL, lang).marquee;
  const row = (hidden) => (
    <div className="marquee-row" aria-hidden={hidden || undefined}>
      {words.map((w) => <span key={w}>{w}<i className="diamond" /></span>)}
    </div>
  );
  return (
    <div className="marquee" role="presentation">
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}
