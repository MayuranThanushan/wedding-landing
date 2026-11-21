import { useLang } from '../i18n/index.jsx';
import { LANGS } from '../i18n/strings.js';

export default function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.code} className={l.code === lang ? 'active' : ''} onClick={() => setLang(l.code)} aria-pressed={l.code === lang}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
