import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { COMMUNITY, errText } from '../../i18n/community.js';
import { events as ALL_EVENTS } from '../../config/wedding.js';
import { requestSong } from '../../lib/api.js';
import Section from '../ui/Section.jsx';
import Reveal from '../Reveal.jsx';
import '../../styles/community.css';

const STORE = 'rg-song-requests';
const readMine = () => { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } };
const writeMine = (v) => { try { localStorage.setItem(STORE, JSON.stringify(v.slice(0, 20))); } catch { /* private mode */ } };

export default function Songs({ code, invite }) {
  const { lang, t } = useLang();
  const s = dict(COMMUNITY, lang);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [eventId, setEventId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [spin, setSpin] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [mine, setMine] = useState(readMine);
  const spinTimer = useRef(null);
  useEffect(() => () => clearTimeout(spinTimer.current), []);

  const myEvents = useMemo(
    () => (invite?.events?.length ? ALL_EVENTS.filter((e) => invite.events.includes(e.id)) : ALL_EVENTS),
    [invite],
  );
  const name = invite?.rsvp?.name || invite?.family_name || '';

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError(s.errName); return; }
    setBusy(true); setError(''); setStatus('');
    const ev = eventId ? t.events?.[eventId] : '';
    try {
      await requestSong(code, { name, title: title.trim(), artist: artist.trim(), note: [ev && `[${ev}]`, note.trim()].filter(Boolean).join(' ') });
      const next = [{ title: title.trim(), artist: artist.trim(), event_id: eventId, at: Date.now() }, ...mine];
      setMine(next); writeMine(next);
      setTitle(''); setArtist(''); setNote('');
      setStatus(s.songThanks);
      setSpin(true); clearTimeout(spinTimer.current);
      spinTimer.current = setTimeout(() => setSpin(false), 2600);
    } catch (err) { setError(errText(s, err)); } finally { setBusy(false); }
  };

  return (
    <Section
      id="songs" tone="plum" num="10" motif
      kicker={s.songsKicker}
      title={<>{s.songsTitle[0]}<em>{s.songsTitle[1]}</em></>}
      lead={s.songsLead}
    >
      <div className="cm-songs">
        <Reveal variant="scale" className="cm-turntable" aria-hidden="true">
          <div className={`cm-vinyl ${spin || busy ? 'is-spinning' : ''}`}>
            <div className="cm-vinyl-label"><span>R</span><i>&amp;</i><span>G</span></div>
          </div>
          <div className={`cm-arm ${spin || busy ? 'is-on' : ''}`} />
          <span className={`cm-notes ${spin ? 'is-on' : ''}`}><i>♪</i><i>♫</i><i>♪</i></span>
        </Reveal>

        <Reveal variant="right" className="cm-song-panel">
          {!code ? (
            <p className="cm-needlink">🎵 {s.needLink}</p>
          ) : (
            <form onSubmit={submit} className="card cm-song-form" noValidate>
              <div className="cm-two">
                <label className="label">
                  {s.songTitle}
                  <input className="input" value={title} maxLength={120} required onChange={(e) => setTitle(e.target.value)} />
                </label>
                <label className="label">
                  {s.songArtist}
                  <input className="input" value={artist} maxLength={120} onChange={(e) => setArtist(e.target.value)} />
                </label>
              </div>
              <label className="label">
                {s.songEvent}
                <select className="select" value={eventId} onChange={(e) => setEventId(e.target.value)}>
                  <option value="">{s.songAny}</option>
                  {myEvents.map((ev) => <option key={ev.id} value={ev.id}>{t.events?.[ev.id]}</option>)}
                </select>
              </label>
              <label className="label">
                {s.songNote}
                <input className="input" value={note} maxLength={150} onChange={(e) => setNote(e.target.value)} />
              </label>
              {error && <p className="cm-error" role="alert">{error}</p>}
              <button className="btn btn-gold btn-block" disabled={busy}>{busy ? s.sending : `♪ ${s.songSend}`}</button>
              <p className="cm-status light" role="status" aria-live="polite">{status}</p>
            </form>
          )}
          {mine.length > 0 && (
            <div className="cm-mine">
              <p className="card-eyebrow">{s.yourRequests}</p>
              <ol>
                {mine.map((m) => (
                  <li key={m.at}>
                    <span className="cm-mine-title">{m.title}</span>
                    {m.artist && <span className="cm-mine-artist"> — {m.artist}</span>}
                    {m.event_id && t.events?.[m.event_id] && <span className="pill">{t.events[m.event_id]}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
