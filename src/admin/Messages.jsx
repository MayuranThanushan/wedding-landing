import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { events, SITE_URL } from '../config/wedding.js';
import { EMPTY_FILTER, EVENT_NAMES, matches, contactEmail, contactPhone, personalize, waLink } from '../lib/audience.js';
import { RSVP_IDS, isRsvpEvent } from './scope.js';
import { saveMessage, deleteMessage, sendEmailNow, DEMO } from '../lib/api.js';
import FilterBar from './FilterBar.jsx';

const site = () => (typeof window !== 'undefined' ? window.location.origin : SITE_URL);

const TEMPLATES = {
  reminder: {
    title: 'Reminder',
    subject: 'Reminder: {event} — Rohit & Gayathiri',
    body: 'Dear {name},\n\nA gentle reminder of the celebration you’re joining us for:\n{events}\n\nYour invitation, map and details: {link}\n\nWe can’t wait to see you!\nRohit & Gayathiri',
  },
  update: {
    title: 'Update',
    subject: 'An update about our wedding celebrations',
    body: 'Dear {name},\n\nWe have an update to share: \n\n…\n\nAll details are always on your invitation: {link}\n\nWith love,\nRohit & Gayathiri',
  },
  rsvpNudge: {
    title: 'RSVP nudge',
    subject: 'Will you join us? Please RSVP',
    body: 'Dear {family},\n\nWe’d love to know if you can join us for our wedding celebrations. Please RSVP on your personal invitation:\n{link}\n\nThank you!\nRohit & Gayathiri',
  },
  thanks: {
    title: 'Thank you',
    subject: 'Thank you for celebrating with us 💛',
    body: 'Dear {name},\n\nThank you for being part of our special day. Your love and blessings mean the world to us.\n\nWith love,\nRohit & Gayathiri',
  },
};

const BLANK = { title: '', subject: '', body: '', audience: { ...EMPTY_FILTER, event: RSVP_IDS[0], status: 'attending' }, send_email: true, send_whatsapp: true, send_at: null, status: 'draft' };

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function audienceLabel(a = {}) {
  const parts = [];
  if (a.status) parts.push({ attending: 'Attending', declined: 'Declined', pending: 'Not responded' }[a.status]);
  if (a.event) parts.push(`${EVENT_NAMES[a.event]}${isRsvpEvent(a.event) ? '' : ' (close family)'}`);
  if (a.food) parts.push({ veg: 'Veg', nonveg: 'Non-veg', allergies: 'Allergies' }[a.food]);
  if (a.side) parts.push(`${a.side} side`);
  if (a.tag) parts.push(`#${a.tag}`);
  if (a.q) parts.push(`“${a.q}”`);
  return parts.join(' · ') || 'Everyone';
}

function WaQueue({ message, rows, onClose, onDone }) {
  const key = `wa-sent-${message.id}`;
  const [sent, setSent] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } });
  const recipients = rows.filter((r) => matches(r, message.audience) && contactPhone(r));
  const mark = (id) => {
    const next = [...new Set([...sent, id])];
    setSent(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
  };
  return (
    <div className="adm-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-card adm-modal-card">
        <h2>WhatsApp queue · {message.title || message.subject}</h2>
        <p className="adm-muted small">
          Tap each guest to open WhatsApp with the message pre-filled, then press send in WhatsApp. {sent.length}/{recipients.length} done.
        </p>
        <ul className="adm-wa-list">
          {recipients.map((r) => (
            <li key={r.id} className={sent.includes(r.id) ? 'done' : ''}>
              <span><strong>{r.rsvp?.name || r.family_name}</strong> <span className="adm-muted">{contactPhone(r)}</span></span>
              <a className="adm-btn small wa" href={waLink(contactPhone(r), personalize(message.body, r, site(), message.audience))} target="_blank" rel="noreferrer" onClick={() => mark(r.id)}>
                {sent.includes(r.id) ? 'Sent ✓ (again)' : 'Open WhatsApp'}
              </a>
            </li>
          ))}
          {recipients.length === 0 && <li className="adm-muted">No recipients with a phone number.</li>}
        </ul>
        <div className="adm-modal-actions">
          <button className="adm-btn ghost" onClick={onClose}>Close</button>
          <button className="adm-btn primary" onClick={onDone}>Mark WhatsApp as done</button>
        </div>
      </div>
    </div>
  );
}

export default function Messages({ rows, messages, reload }) {
  const location = useLocation();
  const [draft, setDraft] = useState(() => ({ ...BLANK, audience: location.state?.audience || BLANK.audience }));
  const [scheduleAt, setScheduleAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [queue, setQueue] = useState(null);

  const recipients = useMemo(() => rows.filter((r) => matches(r, draft.audience)), [rows, draft.audience]);
  const withEmail = recipients.filter(contactEmail).length;
  const withPhone = recipients.filter(contactPhone).length;
  const sample = recipients[0];

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const applyTemplate = (k) => set({ title: TEMPLATES[k].title, subject: TEMPLATES[k].subject, body: TEMPLATES[k].body });
  const insert = (tok) => set({ body: `${draft.body}${tok}` });

  const persist = async (extra) => {
    const saved = await saveMessage({ ...draft, ...extra });
    setDraft(BLANK); setScheduleAt('');
    await reload();
    return saved;
  };

  const run = async (fn) => {
    setBusy(true); setNote('');
    try { await fn(); } catch (e) { setNote(`⚠ ${e.message}`); } finally { setBusy(false); }
  };

  const sendNow = () => run(async () => {
    if (!draft.body.trim()) throw new Error('Write a message first.');
    if (!window.confirm(`Send to ${recipients.length} guests now?`)) return;
    const saved = await persist({ status: draft.send_email ? 'draft' : 'sent', send_at: new Date().toISOString(), sent_at: draft.send_email ? null : new Date().toISOString() });
    if (draft.send_email) {
      const res = await sendEmailNow(saved.id);
      setNote(res.demo ? 'Demo mode: emails are not really sent.' : `✉ ${res.sent} email(s) sent.`);
      await reload();
    }
    if (draft.send_whatsapp) setQueue(saved);
  });

  const schedule = () => run(async () => {
    if (!scheduleAt) throw new Error('Pick a date and time.');
    if (!draft.body.trim()) throw new Error('Write a message first.');
    await persist({ status: 'scheduled', send_at: new Date(scheduleAt).toISOString() });
    setNote('⏰ Scheduled. Emails go out automatically (daily at 9:00 AM India/Sri Lanka time); WhatsApp shows up as “due” on the Overview.');
  });

  const saveDraft = () => run(async () => { await persist({ status: 'draft' }); setNote('Saved as draft.'); });

  const createDefaults = () => run(async () => {
    const now = Date.now();
    let n = 0;
    for (const ev of events) {
      for (const days of [7, 1]) {
        const title = `${EVENT_NAMES[ev.id]} — ${days === 7 ? '1 week' : '1 day'} reminder`;
        if (messages.some((m) => m.title === title)) continue;
        const local = ev.start.slice(0, 10);
        const at = new Date(`${local}T09:00:00+05:30`).getTime() - days * 86400000;
        if (at < now) continue;
        await saveMessage({
          ...BLANK, title, status: 'scheduled', send_at: new Date(at).toISOString(),
          // RSVP event → only guests who said yes; close-family events → everyone invited (no RSVP).
          audience: { ...EMPTY_FILTER, event: ev.id, status: isRsvpEvent(ev.id) ? 'attending' : '' },
          subject: TEMPLATES.reminder.subject, body: TEMPLATES.reminder.body,
        });
        n += 1;
      }
    }
    await reload();
    setNote(n ? `Created ${n} scheduled reminders (1 week and 1 day before each event — to attending guests for the Colombo reception, and to all invited family for the other celebrations).` : 'Reminders already exist.');
  });

  const edit = (m) => { setDraft(m); setScheduleAt(toLocalInput(m.send_at)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = (m) => run(async () => { if (window.confirm('Delete this message?')) { await deleteMessage(m.id); await reload(); } });
  const emailNow = (m) => run(async () => {
    if (!window.confirm('Send this email now?')) return;
    const res = await sendEmailNow(m.id);
    setNote(res.demo ? 'Demo mode: emails are not really sent.' : `✉ ${res.sent} email(s) sent.`);
    await reload();
  });
  const waDone = async (m) => { await saveMessage({ id: m.id, wa_done: true }); setQueue(null); reload(); };

  return (
    <div className="adm-grid">
      <section className="adm-card">
        <div className="adm-card-head">
          <h2>{draft.id ? 'Edit message' : 'New message'}</h2>
          <div className="adm-presets">
            {Object.entries(TEMPLATES).map(([k, v]) => <button key={k} className="adm-btn ghost small" onClick={() => applyTemplate(k)}>{v.title}</button>)}
          </div>
        </div>

        <div className="adm-field"><span>Who should receive it?</span></div>
        <FilterBar value={draft.audience} onChange={(a) => set({ audience: a })} rows={rows} />
        <p className="adm-muted small">
          <strong>{recipients.length}</strong> guests match · ✉ {withEmail} with email · 📲 {withPhone} with WhatsApp
        </p>

        <div className="adm-row">
          <label className="adm-field"><span>Internal title</span><input value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Colombo reception reminder" /></label>
          <div className="adm-field">
            <span>Send via</span>
            <div className="adm-checks inline">
              <label><input type="checkbox" checked={draft.send_email} onChange={(e) => set({ send_email: e.target.checked })} /> Email (automatic)</label>
              <label><input type="checkbox" checked={draft.send_whatsapp} onChange={(e) => set({ send_whatsapp: e.target.checked })} /> WhatsApp (one tap each)</label>
            </div>
          </div>
        </div>
        {draft.send_email && (
          <label className="adm-field"><span>Email subject</span><input value={draft.subject} onChange={(e) => set({ subject: e.target.value })} /></label>
        )}
        <label className="adm-field">
          <span>Message</span>
          <textarea rows={8} value={draft.body} onChange={(e) => set({ body: e.target.value })} />
        </label>
        <div className="adm-presets">
          <span className="adm-muted small">Insert:</span>
          {['{name}', '{family}', '{link}', '{events}', '{event}'].map((t) => <button key={t} className="adm-btn ghost small" onClick={() => insert(t)}>{t}</button>)}
        </div>

        {sample && draft.body && (
          <details className="adm-preview" open>
            <summary>Preview for {sample.rsvp?.name || sample.family_name}</summary>
            {draft.send_email && <p><strong>{personalize(draft.subject, sample, site(), draft.audience)}</strong></p>}
            <pre>{personalize(draft.body, sample, site(), draft.audience)}</pre>
          </details>
        )}

        <div className="adm-toolbar">
          <button className="adm-btn primary" disabled={busy || !recipients.length} onClick={sendNow}>Send now</button>
          <input type="datetime-local" className="adm-input" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
          <button className="adm-btn ghost" disabled={busy} onClick={schedule}>Schedule</button>
          <button className="adm-btn ghost" disabled={busy} onClick={saveDraft}>Save draft</button>
          {draft.id && <button className="adm-btn ghost" onClick={() => { setDraft(BLANK); setScheduleAt(''); }}>Cancel edit</button>}
        </div>
        {note && <p className="adm-note">{note}</p>}
        {DEMO && <p className="adm-muted small">Demo mode — emails are simulated.</p>}
      </section>

      <section className="adm-card">
        <div className="adm-card-head">
          <h2>Scheduled &amp; sent</h2>
          <button className="adm-btn ghost small" disabled={busy} onClick={createDefaults}>+ Auto reminders for every event</button>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Message</th><th>Audience</th><th>When</th><th>Status</th><th /></tr></thead>
            <tbody>
              {messages.map((m) => {
                const due = m.send_whatsapp && !m.wa_done && (m.status === 'sent' || (m.send_at && new Date(m.send_at) <= new Date()));
                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.title || m.subject || '(untitled)'}</strong>
                      <div className="adm-muted small">{[m.send_email && '✉ email', m.send_whatsapp && '📲 WhatsApp'].filter(Boolean).join(' + ')}</div>
                    </td>
                    <td className="small">{audienceLabel(m.audience)}</td>
                    <td className="small">{m.send_at ? new Date(m.send_at).toLocaleString() : '—'}</td>
                    <td className="small">
                      <span className={`adm-pill ${m.status}`}>{m.status}</span>
                      {m.status === 'sent' && m.send_email && <div className="adm-muted">{m.sent_count} emailed</div>}
                      {m.send_whatsapp && <div className={m.wa_done ? 'adm-muted' : 'warn'}>{m.wa_done ? 'WhatsApp done' : due ? 'WhatsApp due' : 'WhatsApp pending'}</div>}
                      {m.error && <div className="adm-error small">{m.error}</div>}
                    </td>
                    <td className="adm-actions">
                      {m.send_whatsapp && <button className="adm-btn small wa" onClick={() => setQueue(m)}>WhatsApp queue</button>}
                      {m.send_email && m.status !== 'sent' && <button className="adm-btn ghost small" onClick={() => emailNow(m)}>Email now</button>}
                      {m.status !== 'sent' && <button className="adm-btn ghost small" onClick={() => edit(m)}>Edit</button>}
                      <button className="adm-btn ghost small danger" onClick={() => remove(m)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {messages.length === 0 && <tr><td colSpan={5} className="adm-muted center">Nothing yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {queue && <WaQueue message={queue} rows={rows} onClose={() => setQueue(null)} onDone={() => waDone(queue)} />}
    </div>
  );
}
