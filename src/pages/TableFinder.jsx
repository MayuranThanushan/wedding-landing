import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { LANGS } from '../i18n/strings.js';
import { dict } from '../i18n/pick.js';
import { findTable } from '../lib/api.js';
import PetalRain from '../components/shell/PetalRain.jsx';
import { Thoranam } from '../components/ui/Ornaments.jsx';
import '../styles/tables.css';

const S = {
  en: {
    welcome: 'Welcome to our reception', title: 'Find your table', hint: 'Type your family name or phone number',
    placeholder: 'e.g. Kumar or 077 123 4567', search: 'Find', table: 'Table', none: 'We couldn’t find that name. Please try another spelling, or ask our welcome team at the entrance.',
    notAssigned: 'Your table is being arranged. Please see our welcome team.', short: 'Type at least 3 letters or digits.', enjoy: 'Enjoy the evening!',
  },
  ta: {
    welcome: 'எங்கள் வரவேற்பு விழாவிற்கு வருக', title: 'உங்கள் மேசையைக் கண்டறியுங்கள்', hint: 'உங்கள் குடும்பப் பெயர் அல்லது தொலைபேசி எண்ணைத் தட்டச்சு செய்யவும்',
    placeholder: 'எ.கா. Kumar அல்லது 077 123 4567', search: 'தேடு', table: 'மேசை', none: 'அந்தப் பெயர் கிடைக்கவில்லை. வேறு எழுத்துக்கூட்டலை முயற்சிக்கவும் அல்லது நுழைவாயிலில் உள்ள வரவேற்புக் குழுவிடம் கேளுங்கள்.',
    notAssigned: 'உங்கள் மேசை ஏற்பாடு செய்யப்படுகிறது. வரவேற்புக் குழுவைச் சந்திக்கவும்.', short: 'குறைந்தது 3 எழுத்துகள் அல்லது இலக்கங்களைத் தட்டச்சு செய்யவும்.', enjoy: 'மாலையை மகிழ்ச்சியாகக் கொண்டாடுங்கள்!',
  },
  te: {
    welcome: 'మా రిసెప్షన్‌కు స్వాగతం', title: 'మీ టేబుల్‌ను కనుగొనండి', hint: 'మీ కుటుంబ పేరు లేదా ఫోన్ నంబర్ టైప్ చేయండి',
    placeholder: 'ఉదా. Kumar లేదా 077 123 4567', search: 'వెతకండి', table: 'టేబుల్', none: 'ఆ పేరు కనుగొనలేకపోయాము. వేరే స్పెల్లింగ్ ప్రయత్నించండి లేదా ప్రవేశ ద్వారం వద్ద మా స్వాగత బృందాన్ని అడగండి.',
    notAssigned: 'మీ టేబుల్ ఏర్పాటు చేయబడుతోంది. దయచేసి మా స్వాగత బృందాన్ని కలవండి.', short: 'కనీసం 3 అక్షరాలు లేదా అంకెలు టైప్ చేయండి.', enjoy: 'సాయంత్రాన్ని ఆనందించండి!',
  },
};

/** Public page behind the common QR code at the venue: guests look up their table. */
export default function TableFinder() {
  const { lang, setLang } = useLang();
  const s = dict(S, lang);
  const [q, setQ] = useState('');
  const [state, setState] = useState({ status: 'idle', rows: [] }); // idle | short | loading | done | error
  const input = useRef(null);
  useEffect(() => { document.title = 'Find your table · Rohit Reddy & Gayathiri'; input.current?.focus(); }, []);

  const go = async (e) => {
    e?.preventDefault();
    const term = q.trim();
    if (term.replace(/[^\p{L}\p{N}]/gu, '').length < 3) return setState({ status: 'short', rows: [] });
    setState({ status: 'loading', rows: [] });
    try { setState({ status: 'done', rows: await findTable(term) }); } catch { setState({ status: 'error', rows: [] }); }
  };

  return (
    <div className="tf">
      <PetalRain />
      <Thoranam className="tf-thoranam" count={17} />
      <div className="tf-langs" role="group" aria-label="Language">
        {LANGS.map((l) => (
          <button key={l.code} className={l.code === lang ? 'on' : ''} onClick={() => setLang(l.code)}>{l.code === 'en' ? 'EN' : l.label}</button>
        ))}
      </div>
      <main className="tf-main">
        <img className="tf-ganesha" src="/assets/art/ganesha-gold.webp" alt="" />
        <p className="tf-welcome">{s.welcome}</p>
        <h1 className="tf-names">Rohit Reddy <i>&amp;</i> Gayathiri</h1>
        <p className="tf-date">20 · 02 · 2027 · Ramada Colombo</p>

        <form className="tf-card" onSubmit={go}>
          <h2>{s.title}</h2>
          <label className="tf-label" htmlFor="tf-q">{s.hint}</label>
          <div className="tf-row">
            <input id="tf-q" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.placeholder} autoComplete="off" enterKeyHint="search" />
            <button className="btn btn-gold" disabled={state.status === 'loading'}>{state.status === 'loading' ? '…' : s.search}</button>
          </div>

          <div className="tf-results" aria-live="polite">
            {state.status === 'short' && <p className="tf-msg">{s.short}</p>}
            {state.status === 'error' && <p className="tf-msg">{s.none}</p>}
            {state.status === 'done' && !state.rows.length && <p className="tf-msg">{s.none}</p>}
            {state.rows.map((r, i) => (
              <div className="tf-hit" key={`${r.family_name}-${i}`} style={{ '--i': i }}>
                <span className="tf-family">{r.family_name}</span>
                {r.table_label
                  ? <span className="tf-table"><small>{s.table}</small><b>{String(r.table_label).replace(/^table\s*/i, '')}</b></span>
                  : <span className="tf-pending">{s.notAssigned}</span>}
              </div>
            ))}
            {state.status === 'done' && state.rows.some((r) => r.table_label) && <p className="tf-enjoy">{s.enjoy}</p>}
          </div>
        </form>
      </main>
      <img className="tf-temples" src="/assets/art/temples.webp" alt="" />
    </div>
  );
}
