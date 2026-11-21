import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { events, eventById } from '../config/wedding.js';
import { EVENT_NAMES, statusFor } from '../lib/audience.js';
import { checkIn, codeFromScan, listCheckins, undoCheckin } from '../lib/api.js';

/** The event happening now, else the next one, else the last one. */
export function currentEventId(now = Date.now()) {
  const live = events.find((e) => new Date(e.end).getTime() + 3 * 3600e3 > now);
  return (live || events[events.length - 1]).id;
}

const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Camera QR scanner: native BarcodeDetector when available, else jsQR on canvas frames. */
function Scanner({ paused, onCode }) {
  const video = useRef(null);
  const canvas = useRef(null);
  const [state, setState] = useState('idle'); // idle | starting | on | error
  const [err, setErr] = useState('');
  const stream = useRef(null);
  const cb = useRef(onCode);
  cb.current = onCode;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setState('idle');
  }, []);

  const start = async () => {
    setState('starting'); setErr('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      stream.current = s;
      video.current.srcObject = s;
      await video.current.play();
      setState('on');
    } catch (e) {
      setErr(e?.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access in the browser settings, or use search below.' : `Camera unavailable (${e?.message || e}). Use search below.`);
      setState('error');
    }
  };

  useEffect(() => {
    if (state !== 'on') return undefined;
    let alive = true; let timer;
    let detector = null; let jsQR = null;
    const init = async () => {
      try {
        if ('BarcodeDetector' in window) {
          const fmts = await window.BarcodeDetector.getSupportedFormats?.();
          if (!fmts || fmts.includes('qr_code')) detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        }
      } catch { detector = null; }
      if (!detector) jsQR = (await import('jsqr')).default;
    };
    const tick = async () => {
      if (!alive) return;
      const v = video.current;
      if (!pausedRef.current && v && v.readyState >= 2) {
        let text = '';
        try {
          if (detector) {
            const found = await detector.detect(v);
            text = found[0]?.rawValue || '';
          } else if (jsQR) {
            const c = canvas.current;
            const w = Math.min(640, v.videoWidth); const h = Math.round((v.videoHeight / v.videoWidth) * w);
            c.width = w; c.height = h;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(v, 0, 0, w, h);
            text = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' })?.data || '';
          }
        } catch { /* keep scanning */ }
        if (text) { if (navigator.vibrate) navigator.vibrate(80); cb.current(text); }
      }
      timer = setTimeout(tick, 180);
    };
    init().then(tick);
    return () => { alive = false; clearTimeout(timer); };
  }, [state]);

  useEffect(() => stop, [stop]);

  return (
    <div className="ci-scanner">
      <div className={`ci-video ${state === 'on' ? 'on' : ''} ${paused ? 'paused' : ''}`}>
        <video ref={video} playsInline muted />
        <canvas ref={canvas} hidden />
        {state === 'on' && <span className="ci-frame" aria-hidden="true" />}
        {state !== 'on' && (
          <div className="ci-video-ph">
            <button className="adm-btn primary big" onClick={start} disabled={state === 'starting'}>
              {state === 'starting' ? 'Starting camera…' : '📷 Start scanning'}
            </button>
            <span className="adm-muted small">Point the camera at the guest’s QR pass.</span>
          </div>
        )}
      </div>
      {err && <p className="adm-error">{err}</p>}
      {state === 'on' && <button className="adm-btn ghost small" onClick={stop}>Stop camera</button>}
    </div>
  );
}

function Stepper({ label, value, onChange }) {
  return (
    <div className="ci-step">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Fewer ${label}`}>−</button>
        <output>{value}</output>
        <button type="button" onClick={() => onChange(value + 1)} aria-label={`More ${label}`}>+</button>
      </div>
    </div>
  );
}

function Arrival({ row, eventId, existing, onDone, onCancel }) {
  const st = statusFor(row, eventId);
  const r = row.rsvp;
  const expA = st === 'attending' ? r.adults || 0 : 0;
  const expC = st === 'attending' ? r.children || 0 : 0;
  const [adults, setAdults] = useState(existing ? existing.adults : (expA || 1));
  const [children, setChildren] = useState(existing ? existing.children : expC);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const warn = {
    'not-invited': `Not invited to ${EVENT_NAMES[eventId]}. Check with the family before admitting.`,
    declined: 'They declined this event in their RSVP.',
    pending: 'No RSVP received for this event.',
  }[st];
  const confirm = async () => {
    setBusy(true); setError('');
    try { await checkIn(row.code, eventId, { adults, children }); onDone(`${row.family_name} checked in · ${adults + children} guest${adults + children === 1 ? '' : 's'}`); } catch (e) { setError(e.message); setBusy(false); }
  };
  return (
    <div className="adm-card ci-arrival">
      <div className="ci-arrival-head">
        <div>
          <h2>{row.family_name}</h2>
          {r?.name && r.name !== row.family_name && <p className="adm-muted">{r.name}</p>}
        </div>
        {row.table_label ? <span className="ci-table">🪑 {row.table_label}</span> : <span className="adm-muted small">No table set</span>}
      </div>
      {warn && <p className="ci-warn">⚠ {warn}</p>}
      {existing && <p className="ci-warn info">✓ Already checked in at {fmtTime(existing.created_at)} with {existing.adults + existing.children}. Confirming again updates the count.</p>}
      {st === 'attending' && (
        <p className="ci-expected">RSVP: <strong>{expA}</strong> adult{expA === 1 ? '' : 's'}{expC ? <> · <strong>{expC}</strong> child{expC === 1 ? '' : 'ren'}</> : ''}
          {r.allergies && <span className="ci-allergy"> · ⚠ {r.allergies}</span>}</p>
      )}
      <div className="ci-steps">
        <Stepper label="Adults arrived" value={adults} onChange={setAdults} />
        <Stepper label="Children arrived" value={children} onChange={setChildren} />
      </div>
      {error && <p className="adm-error">{error}</p>}
      <div className="ci-arrival-actions">
        <button className="adm-btn ghost" onClick={onCancel}>Cancel</button>
        <button className="adm-btn primary big" onClick={confirm} disabled={busy || adults + children === 0}>{busy ? 'Saving…' : 'Confirm arrival'}</button>
      </div>
    </div>
  );
}

export default function CheckIn({ rows }) {
  const [eventId, setEventId] = useState(currentEventId);
  const [checkins, setCheckins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [scanErr, setScanErr] = useState('');
  const lastScan = useRef({ text: '', at: 0 });

  const load = useCallback(() => listCheckins().then(setCheckins).catch(() => {}), []);
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, [load]);
  useEffect(() => { if (!msg) return undefined; const id = setTimeout(() => setMsg(''), 3500); return () => clearTimeout(id); }, [msg]);

  const byId = useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r])), [rows]);
  const here = checkins.filter((c) => c.event_id === eventId);
  const hereByInvite = Object.fromEntries(here.map((c) => [c.invite_id, c]));
  const expected = rows.filter((r) => statusFor(r, eventId) === 'attending');
  const expHeads = expected.reduce((n, r) => n + (r.rsvp.adults || 0) + (r.rsvp.children || 0), 0);
  const arrHeads = here.reduce((n, c) => n + c.adults + c.children, 0);

  const onScan = (text) => {
    const now = Date.now();
    if (text === lastScan.current.text && now - lastScan.current.at < 4000) return;
    lastScan.current = { text, at: now };
    const code = codeFromScan(text);
    const row = rows.find((r) => r.code === code);
    if (!row) { setScanErr(`QR not recognised (“${code.slice(0, 40)}”). Try search.`); return; }
    setScanErr(''); setSelected(row);
  };

  const matchesQ = q.trim().length >= 2
    ? rows.filter((r) => [r.family_name, r.code, r.phone, r.rsvp?.name, r.rsvp?.phone, r.table_label].filter(Boolean).join(' ').toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : [];

  const undo = async (c) => {
    if (!window.confirm(`Undo check-in for ${byId[c.invite_id]?.family_name || 'this family'}?`)) return;
    await undoCheckin(c.id); load();
  };

  const ev = eventById[eventId];
  return (
    <div className="adm-grid ci">
      <div className="ci-top">
        <label className="adm-field ci-event"><span>Checking in for</span>
          <select value={eventId} onChange={(e) => { setEventId(e.target.value); setSelected(null); }}>
            {events.map((e) => <option key={e.id} value={e.id}>{EVENT_NAMES[e.id]} — {new Date(e.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</option>)}
          </select>
        </label>
        <div className="ci-counter" aria-live="polite">
          <div><b>{here.length}</b><span>/ {expected.length} families</span></div>
          <div><b>{arrHeads}</b><span>/ {expHeads} guests</span></div>
          <div className="ci-progress"><span style={{ width: `${expHeads ? Math.min(100, (arrHeads / expHeads) * 100) : 0}%` }} /></div>
        </div>
      </div>

      {msg && <p className="adm-alert">✓ {msg}</p>}

      {selected ? (
        <Arrival key={`${selected.id}-${eventId}`} row={selected} eventId={eventId} existing={hereByInvite[selected.id]}
          onCancel={() => setSelected(null)}
          onDone={(m) => { setMsg(m); setSelected(null); setQ(''); load(); }} />
      ) : null}

      <div className="adm-two">
        <section className="adm-card">
          <h2>Scan QR pass</h2>
          <Scanner paused={!!selected} onCode={onScan} />
          {scanErr && <p className="adm-error">{scanErr}</p>}
        </section>
        <section className="adm-card">
          <h2>Or search</h2>
          <input className="adm-input ci-search" type="search" placeholder="Family name, phone, code or table…" value={q} onChange={(e) => setQ(e.target.value)} />
          <ul className="ci-results">
            {matchesQ.map((r) => {
              const st = statusFor(r, eventId);
              return (
                <li key={r.id}>
                  <button onClick={() => setSelected(r)}>
                    <strong>{r.family_name}</strong>
                    <span className={`adm-pill st-${st}`}>{hereByInvite[r.id] ? 'checked in' : st.replace('-', ' ')}</span>
                  </button>
                </li>
              );
            })}
            {q.trim().length >= 2 && !matchesQ.length && <li className="adm-muted">No matches.</li>}
          </ul>
        </section>
      </div>

      <section className="adm-card">
        <div className="adm-card-head"><h2>Arrived · {EVENT_NAMES[ev.id]}</h2><span className="adm-muted small">refreshes every 15s</span></div>
        {here.length === 0 && <p className="adm-muted">Nobody checked in yet.</p>}
        <ul className="ci-recent">
          {here.map((c) => (
            <li key={c.id}>
              <span className="ci-time">{fmtTime(c.created_at)}</span>
              <span className="ci-name">{byId[c.invite_id]?.family_name || 'Unknown'}{byId[c.invite_id]?.table_label ? <small> · {byId[c.invite_id].table_label}</small> : null}</span>
              <span>{c.adults}+{c.children}</span>
              <button className="adm-btn ghost small" onClick={() => undo(c)}>Undo</button>
            </li>
          ))}
        </ul>
        {expected.length > here.length && (
          <details className="adm-preview">
            <summary>Still expected ({expected.filter((r) => !hereByInvite[r.id]).length})</summary>
            <ul className="ci-recent">
              {expected.filter((r) => !hereByInvite[r.id]).map((r) => (
                <li key={r.id}>
                  <span className="ci-name">{r.family_name}{r.table_label ? <small> · {r.table_label}</small> : null}</span>
                  <span>{r.rsvp.adults}+{r.rsvp.children}</span>
                  <button className="adm-btn ghost small" onClick={() => setSelected(r)}>Check in</button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
