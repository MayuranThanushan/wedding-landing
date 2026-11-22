import { useCallback, useEffect, useRef, useState } from 'react';
import { music } from '../config/wedding.js';
import { createMelody, createTrack } from '../lib/melody.js';
import '../styles/music.css';

const PREF = 'music-muted';
const readMuted = () => { try { return localStorage.getItem(PREF) === '1'; } catch { return false; } };
const saveMuted = (m) => { try { localStorage.setItem(PREF, m ? '1' : '0'); } catch { /* private mode */ } };

/**
 * Background music with a mute button.
 * Plays an original synthesised melody (src/lib/melody.js), or `music` from the config if a file path is set.
 * Starts with the envelope tap (`autoplay`), or on the first tap anywhere for returning visitors,
 * unless the guest muted it before.
 */
export default function MusicButton({ autoplay }) {
  const engine = useRef(null);
  const btn = useRef(null);
  const [on, setOn] = useState(false);
  const [tip, setTip] = useState(false);
  const shownTip = useRef(false);

  // Use the configured MP3 only if the file is actually there; otherwise fall back to the built-in melody.
  const trackOk = useRef(false);
  useEffect(() => {
    if (!music) return;
    fetch(music, { method: 'HEAD' })
      .then((r) => { trackOk.current = r.ok && /audio|mpeg|octet/.test(r.headers.get('content-type') || ''); })
      .catch(() => { trackOk.current = false; });
  }, []);

  const get = () => {
    if (!engine.current) engine.current = music && trackOk.current ? createTrack(music) : createMelody();
    return engine.current;
  };

  const play = useCallback(() => {
    get().start();
    setOn(true);
    if (!shownTip.current) {
      shownTip.current = true;
      setTip(true);
      setTimeout(() => setTip(false), 3800);
    }
  }, []);

  useEffect(() => () => engine.current?.destroy(), []);

  // Envelope opened → start (that tap counts as the user gesture browsers require).
  useEffect(() => {
    if (autoplay && !readMuted() && !engine.current?.isPlaying) play();
  }, [autoplay, play]);

  // Returning visitors skip the envelope, so start on their first tap anywhere (not on this button).
  useEffect(() => {
    const first = (e) => {
      if (btn.current?.contains(e.target)) return;
      if (!readMuted() && !engine.current?.isPlaying) play();
    };
    document.addEventListener('pointerdown', first, { once: true });
    return () => document.removeEventListener('pointerdown', first);
  }, [play]);

  const toggle = () => {
    if (on) { get().stop(); setOn(false); saveMuted(true); setTip(false); }
    else { saveMuted(false); play(); }
  };

  return (
    <div className="mb-wrap">
      <button
        ref={btn}
        type="button"
        className={`mb ${on ? 'is-on' : ''}`}
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? 'Mute music' : 'Play music'}
        title={on ? 'Mute music' : 'Play music'}
      >
        {on ? (
          <span className="mb-bars" aria-hidden="true"><i /><i /><i /><i /></span>
        ) : (
          <svg className="mb-muted" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
            <path d="M16 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </button>
      <span className={`mb-tip ${tip ? 'is-shown' : ''}`} aria-hidden={!tip}>♪ Our song</span>
    </div>
  );
}
