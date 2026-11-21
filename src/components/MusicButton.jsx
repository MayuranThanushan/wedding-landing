import { useEffect, useRef, useState } from 'react';
import { music } from '../config/wedding.js';

/** Starts with the envelope tap (a user gesture, so browsers allow it). Hidden until a track is configured. */
export default function MusicButton({ autoplay }) {
  const audio = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!music || !autoplay || !audio.current) return;
    audio.current.volume = 0.5;
    audio.current.play().then(() => setOn(true)).catch(() => {});
  }, [autoplay]);

  if (!music) return null;
  const toggle = () => {
    const a = audio.current;
    if (a.paused) a.play().then(() => setOn(true)).catch(() => {});
    else { a.pause(); setOn(false); }
  };
  return (
    <>
      <audio ref={audio} src={music} loop preload="none" />
      <button className={`music-btn ${on ? 'on' : ''}`} onClick={toggle} aria-label={on ? 'Pause music' : 'Play music'}>
        {on ? '♫' : '♪'}
      </button>
    </>
  );
}
