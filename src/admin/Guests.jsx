import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { events, SITE_URL } from '../config/wedding.js';
import { EMPTY_FILTER, EVENT_NAMES, matches, statusFor, headcount, contactPhone, inviteLink, personalize, waLink } from '../lib/audience.js';
import { saveInvites, deleteInvite, clearRsvp } from '../lib/api.js';
import FilterBar from './FilterBar.jsx';
import { downloadCsv, parseCsv } from './csv.js';

const ALL = events.map((e) => e.id);
const PRESETS = {
  All: ALL,
  'India only': ALL.filter((id) => id !== 'reception-colombo'),
  'Wedding + Colombo': ['wedding', 'reception-colombo'],
  'Colombo only': ['reception-colombo'],
};
const INVITE_WA = 'Dear {family},\n\nWith great joy we invite you to celebrate the wedding of Rohit & Gayathiri 💛\n\nPlease open your personal invitation and RSVP here:\n{link}\n\nWith love,\nRohit & Gayathiri';
const SHORT = { attending: '✓', declined: '✗', pending: '…' };

const site = () => (typeof window !== 'undefined' ? window.location.origin : SITE_URL);

function parseEvents(s) {
  const v = String(s || '').trim().toLowerCase();
  if (!v || v === 'all') return ALL;
  if (v === 'india') return PRESETS['India only'];
  if (v === 'colombo') return PRESETS['Colombo only'];
  return v.split(/[;|]/).map((x) => x.trim()).filter((x) => ALL.includes(x));
}

function InviteModal({ initial, onClose, onSaved }) {
  const [f, setF] = useState(() => ({
    family_name: '', side: 'both', max_adults: 2, max_children: 0, events: ALL, phone: '', email: '', lang: 'en', tags: [], notes: '', ...initial,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'number' ? Math.max(0, +e.target.value) : e.target.value });
  const toggle = (id) => setF({ ...f, events: f.events.includes(id) ? f.events.filter((x) => x !== id) : ALL.filter((x) => x === id || f.events.includes(x)) });
  const submit = async (e) => {
    e.preventDefault();
    if (!f.events.length) return setError('Pick at least one event.');
    setBusy(true); setError('');
    try { await saveInvites([f]); onSaved(); } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <div className="adm-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="adm-card adm-modal-card" onSubmit={submit}>
        <h2>{f.id ? 'Edit invitation' : 'New invitation'}</h2>
        <label className="adm-field"><span>Family / guest name (shown as “Dear …”) *</span><input value={f.family_name} onChange={set('family_name')} required placeholder="Kumar Family" /></label>
        <div className="adm-row">
          <label className="adm-field"><span>WhatsApp</span><input value={f.phone || ''} onChange={set('phone')} placeholder="+94 77 123 4567" /></label>
          <label className="adm-field"><span>Email</span><input type="email" value={f.email || ''} onChange={set('email')} /></label>
        </div>
        <div className="adm-row">
          <label className="adm-field"><span>Max adults</span><input type="number" min="0" value={f.max_adults} onChange={set('max_adults')} /></label>
          <label className="adm-field"><span>Max children</span><input type="number" min="0" value={f.max_children} onChange={set('max_children')} /></label>
          <label className="adm-field"><span>Side</span>
            <select value={f.side} onChange={set('side')}><option value="bride">Bride</option><option value="groom">Groom</option><option value="both">Both</option></select>
          </label>
          <label className="adm-field"><span>Language</span>
            <select value={f.lang} onChange={set('lang')}><option value="en">English</option><option value="ta">தமிழ்</option><option value="te">తెలుగు</option></select>
          </label>
        </div>
        <div className="adm-field">
          <span>Invited to</span>
          <div className="adm-presets">
            {Object.entries(PRESETS).map(([k, v]) => <button type="button" key={k} className="adm-btn ghost small" onClick={() => setF({ ...f, events: v })}>{k}</button>)}
          </div>
          <div className="adm-checks">
            {events.map((e) => (
              <label key={e.id}><input type="checkbox" checked={f.events.includes(e.id)} onChange={() => toggle(e.id)} /> {EVENT_NAMES[e.id]}</label>
            ))}
          </div>
        </div>
        <label className="adm-field"><span>Tags (comma separated, e.g. colombo, work, cousins)</span>
          <input value={(f.tags || []).join(', ')} onChange={(e) => setF({ ...f, tags: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
        </label>
        <label className="adm-field"><span>Private notes</span><textarea rows={2} value={f.notes || ''} onChange={set('notes')} /></label>
        {error && <p className="adm-error">{error}</p>}
        <div className="adm-modal-actions">
          <button type="button" className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

function ImportModal({ onClose, onSaved }) {
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rows = parseCsv(await file.text());
    const parsed = rows.filter((r) => r.family_name).map((r) => ({
      family_name: r.family_name, phone: r.phone || '', email: r.email || '',
      side: ['bride', 'groom', 'both'].includes(r.side) ? r.side : 'both',
      max_adults: +r.max_adults || 2, max_children: +r.max_children || 0,
      events: parseEvents(r.events), lang: ['en', 'ta', 'te'].includes(r.lang) ? r.lang : 'en',
      tags: (r.tags || '').split(/[;|]/).map((x) => x.trim()).filter(Boolean), notes: r.notes || '',
    }));
    setError(parsed.length ? '' : 'No rows with a family_name column found.');
    setList(parsed);
  };
  const template = () => downloadCsv('invites-template.csv', [
    ['family_name', 'phone', 'email', 'side', 'max_adults', 'max_children', 'events', 'lang', 'tags', 'notes'],
    ['Kumar Family', '+94 77 123 4567', 'kumar@example.com', 'bride', '4', '2', 'wedding;reception-colombo', 'ta', 'colombo;cousins', ''],
    ['Reddy Family', '+91 98450 00001', '', 'groom', '2', '0', 'india', 'te', 'ballari', ''],
    ['Nimal & Anu', '+94 71 222 3333', '', 'bride', '2', '0', 'colombo', 'en', 'friends', ''],
  ]);
  const save = async () => {
    setBusy(true);
    try { await saveInvites(list); onSaved(); } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <div className="adm-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-card adm-modal-card">
        <h2>Import invitations from CSV</h2>
        <p className="adm-muted small">
          Columns: <code>family_name, phone, email, side, max_adults, max_children, events, lang, tags, notes</code>.<br />
          <code>events</code> = <code>all</code>, <code>india</code>, <code>colombo</code>, or ids separated by <code>;</code> ({ALL.join(', ')}).
          Export a Google Sheet / Excel as CSV.
        </p>
        <div className="adm-row">
          <input type="file" accept=".csv,text/csv" onChange={onFile} />
          <button type="button" className="adm-btn ghost small" onClick={template}>Download template</button>
        </div>
        {list.length > 0 && (
          <div className="adm-table-wrap short">
            <table className="adm-table">
              <thead><tr><th>Family</th><th>Phone</th><th>Seats</th><th>Events</th><th>Lang</th></tr></thead>
              <tbody>{list.map((r, i) => (
                <tr key={i}><td>{r.family_name}</td><td>{r.phone}</td><td>{r.max_adults}+{r.max_children}</td><td>{r.events.length}</td><td>{r.lang}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {error && <p className="adm-error">{error}</p>}
        <div className="adm-modal-actions">
          <button type="button" className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" disabled={!list.length || busy} onClick={save}>{busy ? 'Importing…' : `Import ${list.length}`}</button>
        </div>
      </div>
    </div>
  );
}

export default function Guests({ rows, reload }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState(() => ({ ...EMPTY_FILTER, event: params.get('event') || '', status: params.get('status') || '' }));
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState('');

  const list = useMemo(() => rows.filter((r) => matches(r, filter)), [rows, filter]);
  const totals = useMemo(() => list.reduce((t, r) => {
    const att = statusFor(r, filter.event) === 'attending';
    if (att) { t.heads += headcount(r); t.veg += r.rsvp.veg || 0; t.nonveg += r.rsvp.nonveg || 0; }
    return t;
  }, { heads: 0, veg: 0, nonveg: 0 }), [list, filter.event]);

  const copy = async (r) => {
    await navigator.clipboard.writeText(inviteLink(r, site()));
    setCopied(r.id); setTimeout(() => setCopied(''), 1500);
  };
  const remove = async (r) => {
    if (!window.confirm(`Delete the invitation for “${r.family_name}”? Their RSVP will be deleted too.`)) return;
    await deleteInvite(r.id); reload();
  };
  const reset = async (r) => {
    if (!window.confirm(`Clear ${r.family_name}’s RSVP so they can answer again?`)) return;
    await clearRsvp(r.id); reload();
  };

  const exportCsv = () => {
    const head = ['code', 'link', 'family_name', 'side', 'tags', 'invited_events', 'rsvp_name', 'phone', 'email',
      ...events.map((e) => EVENT_NAMES[e.id]), 'adults', 'children', 'veg', 'nonveg', 'allergies', 'message', 'opened', 'responded_at'];
    const body = list.map((r) => [
      r.code, inviteLink(r, site()), r.family_name, r.side, (r.tags || []).join(';'), (r.events || []).join(';'),
      r.rsvp?.name || '', contactPhone(r), r.rsvp?.email || r.email || '',
      ...events.map((e) => { const s = statusFor(r, e.id); return s === 'not-invited' ? '' : s; }),
      r.rsvp?.adults ?? '', r.rsvp?.children ?? '', r.rsvp?.veg ?? '', r.rsvp?.nonveg ?? '',
      r.rsvp?.allergies || '', r.rsvp?.message || '', r.open_count || 0, r.rsvp?.updated_at || '',
    ]);
    downloadCsv(`guests-${new Date().toISOString().slice(0, 10)}.csv`, [head, ...body]);
  };

  return (
    <div className="adm-grid">
      <div className="adm-toolbar">
        <button className="adm-btn primary" onClick={() => setEditing({})}>+ New invitation</button>
        <button className="adm-btn ghost" onClick={() => setImporting(true)}>Import CSV</button>
        <button className="adm-btn ghost" onClick={exportCsv}>Export {list.length} to CSV</button>
        <button className="adm-btn ghost" onClick={() => navigate('/admin/messages', { state: { audience: filter } })}>✉ Message these {list.length}</button>
      </div>
      <FilterBar value={filter} onChange={setFilter} rows={rows} />
      <p className="adm-muted small">
        Showing <strong>{list.length}</strong> of {rows.length} invitations · {totals.heads} attending guests
        {filter.event ? ` for ${EVENT_NAMES[filter.event]}` : ''} · 🥗 {totals.veg} · 🍗 {totals.nonveg}
        {Object.values(filter).some(Boolean) && <> · <button className="adm-link" onClick={() => setFilter(EMPTY_FILTER)}>clear filters</button></>}
      </p>

      <div className="adm-card flush">
        <div className="adm-table-wrap">
          <table className="adm-table guests">
            <thead>
              <tr>
                <th>Guest</th><th>Contact</th>
                {events.map((e) => <th key={e.id} title={EVENT_NAMES[e.id]} className="ev">{EVENT_NAMES[e.id].replace('Reception', 'Rec.').replace('Ceremony', '')}</th>)}
                <th>Guests</th><th>🥗/🍗</th><th>Notes</th><th />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.family_name}</strong>
                    {r.rsvp?.name && r.rsvp.name !== r.family_name && <div className="adm-muted small">{r.rsvp.name}</div>}
                    <div className="adm-muted small">
                      {r.side !== 'both' && `${r.side} · `}{r.lang} · max {r.max_adults}+{r.max_children}
                      {r.open_count > 0 ? ` · 👁 ${r.open_count}` : ' · not opened'}
                    </div>
                    {(r.tags || []).map((t) => <span className="adm-tag" key={t}>#{t}</span>)}
                  </td>
                  <td className="small">
                    {contactPhone(r) && <div>{contactPhone(r)}</div>}
                    {(r.rsvp?.email || r.email) && <div className="adm-muted">{r.rsvp?.email || r.email}</div>}
                  </td>
                  {events.map((e) => {
                    const s = statusFor(r, e.id);
                    return <td key={e.id} className={`ev st-${s}`}>{s === 'not-invited' ? '' : SHORT[s]}</td>;
                  })}
                  <td>{r.rsvp ? `${r.rsvp.adults}+${r.rsvp.children}` : '—'}</td>
                  <td>{r.rsvp ? `${r.rsvp.veg}/${r.rsvp.nonveg}` : '—'}</td>
                  <td className="small notes">
                    {r.rsvp?.allergies && <div>⚠ {r.rsvp.allergies}</div>}
                    {r.rsvp?.message && <div className="adm-muted">“{r.rsvp.message}”</div>}
                    {r.notes && <div className="adm-muted">📝 {r.notes}</div>}
                  </td>
                  <td className="adm-actions">
                    <button className="adm-btn ghost small" onClick={() => copy(r)}>{copied === r.id ? 'Copied!' : 'Copy link'}</button>
                    {contactPhone(r) && (
                      <a className="adm-btn ghost small wa" href={waLink(contactPhone(r), personalize(INVITE_WA, r, site()))} target="_blank" rel="noreferrer">WhatsApp invite</a>
                    )}
                    <button className="adm-btn ghost small" onClick={() => setEditing(r)}>Edit</button>
                    {r.rsvp && <button className="adm-btn ghost small" onClick={() => reset(r)}>Reset RSVP</button>}
                    <button className="adm-btn ghost small danger" onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={events.length + 6} className="adm-muted center">No invitations match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <p className="adm-muted small">✓ attending · ✗ declined · … not responded · blank = not invited</p>

      {editing && <InviteModal initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {importing && <ImportModal onClose={() => setImporting(false)} onSaved={() => { setImporting(false); reload(); }} />}
    </div>
  );
}
