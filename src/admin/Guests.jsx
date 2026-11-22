import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SITE_URL, rsvpEvents } from '../config/wedding.js';
import { contactPhone, inviteLink, personalize, waLink } from '../lib/audience.js';
import { saveInvites, deleteInvite, clearRsvp } from '../lib/api.js';
import FilterBar from './FilterBar.jsx';
import { downloadCsv, parseCsv } from './csv.js';
import { COUPLE, EMPTY, STATUS_LABEL, filterRow, nonveg, status, total, veg } from './reception.js';

const INVITE_WA = `Dear {family},\n\nWith great joy we invite you to the wedding reception of ${COUPLE} 💛\n\nPlease open your personal invitation and RSVP here:\n{link}\n\nWith love,\n${COUPLE}`;
const site = () => (typeof window !== 'undefined' ? window.location.origin : SITE_URL);
const LANGS = { en: 'English', ta: 'தமிழ்', te: 'తెలుగు' };
const splitTags = (s) => String(s || '').split(/[;|,]/).map((x) => x.trim()).filter(Boolean);

function InviteModal({ initial, onClose, onSaved }) {
  const [f, setF] = useState(() => ({ family_name: '', phone: '', email: '', lang: 'en', tags: [], notes: '', table_label: '', ...initial }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const row = {
      id: f.id, code: f.code, family_name: f.family_name.trim(), phone: f.phone || '', email: f.email || '', lang: f.lang,
      tags: f.tags || [], notes: f.notes || '', table_label: (f.table_label || '').trim() || null, events: rsvpEvents,
    };
    try { await saveInvites([row]); onSaved(); } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <div className="adm-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="adm-card adm-modal-card" onSubmit={submit}>
        <h2>{f.id ? 'Edit invitation' : 'New invitation'}</h2>
        <p className="adm-muted small">Reception · Colombo. The guest tells us how many vegetarian and non-vegetarian meals in their RSVP.</p>
        <label className="adm-field"><span>Family / guest name (shown as “Dear …”) *</span><input value={f.family_name} onChange={set('family_name')} required placeholder="Kumar Family" /></label>
        <div className="adm-row">
          <label className="adm-field"><span>WhatsApp</span><input value={f.phone || ''} onChange={set('phone')} placeholder="+94 77 123 4567" /></label>
          <label className="adm-field"><span>Email</span><input type="email" value={f.email || ''} onChange={set('email')} /></label>
        </div>
        <div className="adm-row">
          <label className="adm-field"><span>Language</span>
            <select value={f.lang} onChange={set('lang')}>{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="adm-field"><span>Table (optional)</span><input value={f.table_label || ''} onChange={set('table_label')} placeholder="Table 4" /></label>
        </div>
        <label className="adm-field"><span>Tags (comma separated, e.g. cousins, work, school)</span>
          <input value={(f.tags || []).join(', ')} onChange={(e) => setF({ ...f, tags: splitTags(e.target.value) })} />
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
    const parsed = parseCsv(await file.text()).filter((r) => r.family_name).map((r) => ({
      family_name: r.family_name, phone: r.phone || '', email: r.email || '',
      lang: ['en', 'ta', 'te'].includes(r.lang) ? r.lang : 'en',
      tags: splitTags(r.tags), table_label: r.table || r.table_label || null, notes: r.notes || '', events: rsvpEvents,
    }));
    setError(parsed.length ? '' : 'No rows with a family_name column found.');
    setList(parsed);
  };
  const template = () => downloadCsv('invites-template.csv', [
    ['family_name', 'phone', 'email', 'lang', 'tags', 'table', 'notes'],
    ['Kumar Family', '+94 77 123 4567', 'kumar@example.com', 'ta', 'cousins', 'Table 3', ''],
    ['Nimal & Anu', '+94 71 222 3333', '', 'en', 'friends;school', '', ''],
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
          Columns: <code>family_name, phone, email, lang, tags, table, notes</code>. <code>lang</code> = en / ta / te; separate tags with <code>;</code>.
          Every imported invite is for the Colombo reception. Export a Google Sheet / Excel as CSV.
        </p>
        <div className="adm-row">
          <input type="file" accept=".csv,text/csv" onChange={onFile} />
          <button type="button" className="adm-btn ghost small" onClick={template}>Download template</button>
        </div>
        {list.length > 0 && (
          <div className="adm-table-wrap short">
            <table className="adm-table">
              <thead><tr><th>Family</th><th>Phone</th><th>Email</th><th>Lang</th><th>Table</th></tr></thead>
              <tbody>{list.map((r, i) => (
                <tr key={i}><td>{r.family_name}</td><td>{r.phone}</td><td>{r.email}</td><td>{r.lang}</td><td>{r.table_label || '—'}</td></tr>
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
  const [filter, setFilter] = useState(() => ({ ...EMPTY, status: params.get('status') || '' }));
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState('');

  const list = useMemo(() => rows.filter((r) => filterRow(r, filter)), [rows, filter]);
  const totals = useMemo(() => list.reduce((t, r) => ({ veg: t.veg + veg(r), nonveg: t.nonveg + nonveg(r) }), { veg: 0, nonveg: 0 }), [list]);

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
    const head = ['code', 'link', 'family_name', 'lang', 'tags', 'table', 'rsvp_name', 'phone', 'email', 'response', 'veg', 'nonveg', 'total', 'opened', 'responded_at', 'notes'];
    const body = list.map((r) => [
      r.code, inviteLink(r, site()), r.family_name, r.lang || '', (r.tags || []).join(';'), r.table_label || '',
      r.rsvp?.name || '', contactPhone(r), r.rsvp?.email || r.email || '', STATUS_LABEL[status(r)],
      veg(r), nonveg(r), total(r), r.open_count || 0, r.rsvp?.updated_at || '', r.notes || '',
    ]);
    downloadCsv(`reception-guests-${new Date().toISOString().slice(0, 10)}.csv`, [head, ...body]);
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
        Showing <strong>{list.length}</strong> of {rows.length} invitations · <strong>{totals.veg + totals.nonveg}</strong> guests attending · 🥗 {totals.veg} veg · 🍗 {totals.nonveg} non-veg
        {Object.values(filter).some(Boolean) && <> · <button className="adm-link" onClick={() => setFilter(EMPTY)}>clear filters</button></>}
      </p>

      <div className="adm-card flush">
        <div className="adm-table-wrap">
          <table className="adm-table guests">
            <thead>
              <tr><th>Guest</th><th>Contact</th><th>Response</th><th>🥗 Veg</th><th>🍗 Non-veg</th><th>Total</th><th>Notes</th><th /></tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const st = status(r);
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.family_name}</strong>
                      {r.rsvp?.name && r.rsvp.name !== r.family_name && <div className="adm-muted small">{r.rsvp.name}</div>}
                      <div className="adm-muted small">
                        {r.lang || 'en'}{r.open_count > 0 ? ` · 👁 ${r.open_count}` : ' · not opened'}{r.table_label && ` · 🪑 ${r.table_label}`}
                      </div>
                      {(r.tags || []).map((t) => <span className="adm-tag" key={t}>#{t}</span>)}
                    </td>
                    <td className="small">
                      {contactPhone(r) && <div>{contactPhone(r)}</div>}
                      {(r.rsvp?.email || r.email) && <div className="adm-muted">{r.rsvp?.email || r.email}</div>}
                    </td>
                    <td><span className={`adm-pill st-${st}`}>{STATUS_LABEL[st]}</span></td>
                    <td>{st === 'attending' ? veg(r) : '—'}</td>
                    <td>{st === 'attending' ? nonveg(r) : '—'}</td>
                    <td><strong>{st === 'attending' ? total(r) : '—'}</strong></td>
                    <td className="small notes">{r.notes && <div className="adm-muted">📝 {r.notes}</div>}</td>
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
                );
              })}
              {list.length === 0 && <tr><td colSpan={8} className="adm-muted center">No invitations match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <InviteModal initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {importing && <ImportModal onClose={() => setImporting(false)} onSaved={() => { setImporting(false); reload(); }} />}
    </div>
  );
}
