import { createContext, useContext, useEffect, useState } from 'react';
import { STRINGS } from './strings.js';

const LangContext = createContext(null);

function storedLang() {
  try { return localStorage.getItem('lang'); } catch { return null; }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => storedLang() || 'en');
  const [chosen, setChosen] = useState(() => !!storedLang());

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    setChosen(true);
    try { localStorage.setItem('lang', l); } catch { /* private mode */ }
  };
  // Invite's preferred language applies only until the guest picks one themselves.
  const suggestLang = (l) => { if (!chosen && l) setLangState(l); };

  return (
    <LangContext.Provider value={{ lang, setLang, suggestLang, t: STRINGS[lang] || STRINGS.en }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
