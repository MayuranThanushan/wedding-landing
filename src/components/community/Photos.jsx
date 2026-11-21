import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { COMMUNITY, errText } from '../../i18n/community.js';
import { events as ALL_EVENTS } from '../../config/wedding.js';
import { listPhotos, photoUrl, uploadPhoto } from '../../lib/api.js';
import Section from '../ui/Section.jsx';
import Reveal from '../Reveal.jsx';
import '../../styles/community.css';

let nextKey = 0;

function Lightbox({ photos, index, onClose, onMove, s, eventName }) {
  const p = photos[index];
  const touch = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onMove(1);
      else if (e.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose, onMove]);
  if (!p) return null;
  return (
    <div
      className="cm-lightbox" role="dialog" aria-modal="true" aria-label={p.caption || s.photosKicker}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) onMove(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <button ref={closeRef} type="button" className="cm-lb-close" onClick={onClose} aria-label={s.close}>×</button>
      {photos.length > 1 && <button type="button" className="cm-lb-nav prev" onClick={() => onMove(-1)} aria-label={s.prev}>‹</button>}
      <figure className="cm-lb-figure" key={p.id}>
        <img src={photoUrl(p)} alt={p.caption || ''} />
        <figcaption>
          {p.caption && <span className="cm-lb-cap">{p.caption}</span>}
          <span className="cm-lb-meta">
            {p.name && <>{s.by} {p.name}</>}
            {p.event_id && eventName(p.event_id) && <> · {eventName(p.event_id)}</>}
            <> · {index + 1}/{photos.length}</>
          </span>
        </figcaption>
      </figure>
      {photos.length > 1 && <button type="button" className="cm-lb-nav next" onClick={() => onMove(1)} aria-label={s.next}>›</button>}
    </div>
  );
}

export default function Photos({ code, invite }) {
  const { lang, t } = useLang();
  const s = dict(COMMUNITY, lang);
  const [photos, setPhotos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(-1);
  const [queue, setQueue] = useState([]); // { key, file, url, status: wait|up|done|err, error }
  const [eventId, setEventId] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [note, setNote] = useState('');
  const inputRef = useRef(null);

  const myEvents = useMemo(
    () => (invite?.events?.length ? ALL_EVENTS.filter((e) => invite.events.includes(e.id)) : ALL_EVENTS),
    [invite],
  );
  const eventName = useCallback((id) => t.events?.[id] || '', [t]);

  useEffect(() => {
    let alive = true;
    listPhotos().then((p) => alive && setPhotos(p || [])).catch(() => {});
    return () => { alive = false; };
  }, []);
  // revoke preview URLs on unmount
  const queueRef = useRef(queue);
  queueRef.current = queue;
  useEffect(() => () => queueRef.current.forEach((q) => URL.revokeObjectURL(q.url)), []);

  const tabs = useMemo(() => {
    const ids = [...new Set(photos.map((p) => p.event_id).filter(Boolean))];
    return ids.filter((id) => eventName(id));
  }, [photos, eventName]);
  const shown = filter === 'all' ? photos : photos.filter((p) => p.event_id === filter);

  const addFiles = (list) => {
    const files = [...(list || [])].filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setNote('');
    setQueue((q) => [...q, ...files.map((file) => ({ key: nextKey += 1, file, url: URL.createObjectURL(file), status: 'wait' }))]);
  };
  const removeItem = (key) => setQueue((q) => q.filter((x) => {
    if (x.key === key) URL.revokeObjectURL(x.url);
    return x.key !== key;
  }));

  const pending = queue.filter((q) => q.status === 'wait' || q.status === 'err');
  const name = invite?.rsvp?.name || invite?.family_name || '';

  const startUpload = async () => {
    if (!pending.length) return;
    setBusy(true); setNote('');
    let ok = 0;
    for (const item of pending) {
      setQueue((q) => q.map((x) => (x.key === item.key ? { ...x, status: 'up', error: '' } : x)));
      try {
        await uploadPhoto(code, item.file, { name, caption: caption.trim(), event_id: eventId });
        ok += 1;
        setQueue((q) => q.map((x) => (x.key === item.key ? { ...x, status: 'done' } : x)));
      } catch (err) {
        setQueue((q) => q.map((x) => (x.key === item.key ? { ...x, status: 'err', error: errText(s, err) } : x)));
      }
    }
    setBusy(false);
    if (ok) { setNote(s.uploadedNote(ok)); setCaption(''); }
  };

  const statusLabel = { wait: s.statusWait, up: s.statusUp, done: s.statusDone, err: s.statusErr };
  const move = useCallback((d) => setOpen((i) => (i + d + shown.length) % shown.length), [shown.length]);
  const close = useCallback(() => setOpen(-1), []);

  return (
    <Section
      id="photos" tone="cream" num="07"
      kicker={s.photosKicker}
      title={<>{s.photosTitle[0]}<em>{s.photosTitle[1]}</em></>}
      lead={s.photosLead}
    >
      <Reveal className="cm-upload card">
        {!code ? (
          <p className="cm-needlink">📷 {s.needLink}</p>
        ) : (
          <>
            <div
              className={`cm-drop ${drag ? 'is-drag' : ''}`}
              role="button" tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
            >
              <span className="cm-drop-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="11" width="38" height="28" rx="5" /><circle cx="24" cy="25" r="8" /><path d="M16 11l3-5h10l3 5" />
                </svg>
              </span>
              <strong>{s.dropHere}</strong>
              <span>{s.orTap}</span>
              <input
                ref={inputRef} type="file" accept="image/*" multiple hidden
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
              />
            </div>

            {queue.length > 0 && (
              <ul className="cm-queue">
                {queue.map((q) => (
                  <li key={q.key} className={`cm-thumb is-${q.status}`}>
                    <img src={q.url} alt="" />
                    <span className="cm-thumb-status" title={q.error || ''}>
                      {q.status === 'up' && <span className="cm-spinner" aria-hidden="true" />}
                      {q.status === 'done' && '✓ '}
                      {statusLabel[q.status]}
                    </span>
                    {(q.status === 'wait' || q.status === 'err') && !busy && (
                      <button type="button" className="cm-thumb-x" onClick={() => removeItem(q.key)} aria-label={s.remove}>×</button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="cm-upload-fields">
              <label className="label">
                {s.pickEvent}
                <select className="select" value={eventId} onChange={(e) => setEventId(e.target.value)}>
                  <option value="">{s.anyEvent}</option>
                  {myEvents.map((ev) => <option key={ev.id} value={ev.id}>{eventName(ev.id)}</option>)}
                </select>
              </label>
              <label className="label">
                {s.caption}
                <input className="input" value={caption} maxLength={200} onChange={(e) => setCaption(e.target.value)} />
              </label>
            </div>
            <div className="cm-upload-foot">
              <p className="cm-small">{s.approvalNote}</p>
              <button type="button" className="btn btn-pink" disabled={busy || !pending.length} onClick={startUpload}>
                {busy ? s.uploading : s.upload(pending.length)}
              </button>
            </div>
            <p className="cm-status" role="status" aria-live="polite">{note}</p>
          </>
        )}
      </Reveal>

      {photos.length > 0 && tabs.length > 1 && (
        <div className="cm-tabs">
          <div className="seg" role="tablist">
            <button type="button" role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>{s.all}</button>
            {tabs.map((id) => (
              <button type="button" role="tab" key={id} aria-selected={filter === id} onClick={() => setFilter(id)}>{eventName(id)}</button>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 ? (
        <Reveal className="cm-album-empty">
          <div className="cm-frames" aria-hidden="true"><span /><span /><span /></div>
          <p>{s.albumEmpty}</p>
        </Reveal>
      ) : (
        <div className="cm-album">
          {shown.map((p, i) => (
            <Reveal key={p.id} variant="fade" delay={Math.min(i, 10) * 0.05} className="cm-album-item">
              <button type="button" onClick={() => setOpen(i)} aria-label={p.caption || `${s.photosKicker} ${i + 1}`}>
                <img src={photoUrl(p)} alt={p.caption || ''} loading="lazy" />
                {(p.caption || p.name) && <span className="cm-album-cap">{p.caption || `${s.by} ${p.name}`}</span>}
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {open >= 0 && <Lightbox photos={shown} index={open} onClose={close} onMove={move} s={s} eventName={eventName} />}
    </Section>
  );
}
