import { useMemo, useState } from 'react';
import { events, eventById, venues } from '../config/wedding.js';
import { EVENT_NAMES, statusFor, headcount, contactPhone } from '../lib/audience.js';
import { saveInvites } from '../lib/api.js';
import { downloadCsv } from './csv.js';

const UNASSIGNED = 'Unassigned';
const tableSort = (a, b) => (a === UNASSIGNED ? 1 : b === UNASSIGNED ? -1 : a.localeCompare(b, undefined, { numeric: true }));

function Catering({ rows, eventId }) {
  const ev = eventById[eventId];
  const v = venues[ev.venue];
  const list = rows.filter((r) => statusFor(r, eventId) === 'attending').sort((a, b) => a.family_name.localeCompare(b.family_name));
  const t = list.reduce((s, r) => ({
    adults: s.adults + (r.rsvp.adults || 0), children: s.children + (r.rsvp.children || 0),
    veg: s.veg + (r.rsvp.veg || 0), nonveg: s.nonveg + (r.rsvp.nonveg || 0),
  }), { adults: 0, children: 0, veg: 0, nonveg: 0 });
  const pending = rows.filter((r) => statusFor(r, eventId) === 'pending');
  const maxPending = pending.reduce((n, r) => n + (r.max_adults || 0) + (r.max_children || 0), 0);
  const allergies = list.filter((r) => r.rsvp.allergies);
  const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: v.timeZone }).format(new Date(ev.start));

  return (
    <section className="adm-card rep-sheet">
      <header className="rep-head">
        <p className="rep-kicker">Catering sheet</p>
        <h2>{EVENT_NAMES[eventId]}</h2>
        <p className="adm-muted">{date} · {v.name}, {v.address}</p>
        <p className="adm-muted small">Printed {new Date().toLocaleString('en-GB')}</p>
      </header>
      <div className="rep-totals">
        <div><b>{t.adults + t.children}</b><span>Total guests</span></div>
        <div><b>{t.adults}</b><span>Adults</span></div>
        <div><b>{t.children}</b><span>Children</span></div>
        <div><b>{t.veg}</b><span>Vegetarian meals</span></div>
        <div><b>{t.nonveg}</b><span>Non-veg meals</span></div>
        <div><b>{allergies.length}</b><span>Families with allergies</span></div>
      </div>
      {pending.length > 0 && <p className="ci-warn">⏳ {pending.length} invited famil{pending.length === 1 ? 'y has' : 'ies have'} not replied yet (up to {maxPending} more guests).</p>}

      {allergies.length > 0 && (
        <>
          <h3 className="rep-sub">⚠ Allergies &amp; dietary notes</h3>
          <ul className="rep-allergies">
            {allergies.map((r) => <li key={r.id}><strong>{r.family_name}</strong>{r.table_label ? ` (${r.table_label})` : ''}: {r.rsvp.allergies}</li>)}
          </ul>
        </>
      )}

      <h3 className="rep-sub">Guest list</h3>
      <div className="adm-table-wrap">
        <table className="adm-table rep-table">
          <thead><tr><th>Family</th><th>Table</th><th>Adults</th><th>Children</th><th>Veg</th><th>Non-veg</th><th>Allergies</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.family_name}</strong>{r.rsvp.name !== r.family_name && <div className="adm-muted small">{r.rsvp.name}</div>}</td>
                <td>{r.table_label || '—'}</td>
                <td>{r.rsvp.adults}</td><td>{r.rsvp.children}</td><td>{r.rsvp.veg}</td><td>{r.rsvp.nonveg}</td>
                <td className="small">{r.rsvp.allergies}</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} className="center adm-muted">No confirmed guests yet.</td></tr>}
          </tbody>
          {list.length > 0 && (
            <tfoot><tr><th>Total · {list.length} families</th><th /><th>{t.adults}</th><th>{t.children}</th><th>{t.veg}</th><th>{t.nonveg}</th><th /></tr></tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

function Seating({ rows, eventId, reload }) {
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const list = useMemo(
    () => rows.filter((r) => (eventId ? statusFor(r, eventId) === 'attending' : statusFor(r) === 'attending'))
      .sort((a, b) => a.family_name.localeCompare(b.family_name)),
    [rows, eventId],
  );
  const label = (r) => (r.id in draft ? draft[r.id] : r.table_label || '').trim();
  const groups = {};
  for (const r of list) (groups[label(r) || UNASSIGNED] ||= []).push(r);
  const tables = Object.keys(groups).sort(tableSort);
  const existing = [...new Set(rows.map((r) => r.table_label).filter(Boolean))].sort(tableSort);

  const save = async (r) => {
    const v = (draft[r.id] ?? '').trim();
    if (!(r.id in draft) || v === (r.table_label || '')) return;
    setSaving(r.id); setError('');
    try {
      await saveInvites([{ id: r.id, table_label: v || null }]);
      await reload();
      setDraft((d) => { const n = { ...d }; delete n[r.id]; return n; });
    } catch (e) { setError(e.message); } finally { setSaving(''); }
  };

  const exportCsv = () => downloadCsv('seating.csv', [
    ['table', 'family', 'rsvp_name', 'adults', 'children', 'veg', 'nonveg', 'allergies', 'phone'],
    ...tables.flatMap((tb) => groups[tb].map((r) => [tb === UNASSIGNED ? '' : tb, r.family_name, r.rsvp.name, r.rsvp.adults, r.rsvp.children, r.rsvp.veg, r.rsvp.nonveg, r.rsvp.allergies || '', contactPhone(r)])),
  ]);

  return (
    <>
      <section className="adm-card no-print">
        <div className="adm-card-head">
          <h2>Assign tables</h2>
          <button className="adm-btn ghost small" onClick={exportCsv}>Export seating CSV</button>
        </div>
        <p className="adm-muted small">Type a table name (e.g. “Table 4” or “Family head table”). Saves when you leave the field. The table shows on the check-in screen.</p>
        <datalist id="tables">{existing.map((t) => <option key={t} value={t} />)}</datalist>
        {error && <p className="adm-error">{error}</p>}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Family</th><th>Guests</th><th>Table</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.family_name}</strong> <span className="adm-muted small">{r.side !== 'both' ? r.side : ''}</span></td>
                  <td>{headcount(r)}</td>
                  <td>
                    <input className="adm-input seat-input" list="tables" placeholder="Unassigned"
                      value={r.id in draft ? draft[r.id] : r.table_label || ''}
                      onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })}
                      onBlur={() => save(r)} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
                    {saving === r.id && <span className="adm-muted small"> saving…</span>}
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={3} className="center adm-muted">No attending families yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="adm-card rep-sheet">
        <header className="rep-head">
          <p className="rep-kicker">Seating plan</p>
          <h2>{eventId ? EVENT_NAMES[eventId] : 'All celebrations'}</h2>
        </header>
        <div className="seat-grid">
          {tables.map((tb) => {
            const heads = groups[tb].reduce((n, r) => n + headcount(r), 0);
            return (
              <div key={tb} className={`seat-table ${tb === UNASSIGNED ? 'unassigned' : ''}`}>
                <h3>{tb}<span>{heads} guest{heads === 1 ? '' : 's'}</span></h3>
                <ul>{groups[tb].map((r) => <li key={r.id}>{r.family_name}<span>{r.rsvp.adults}+{r.rsvp.children}</span></li>)}</ul>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default function Reports({ rows, reload }) {
  const [tab, setTab] = useState('catering');
  const [eventId, setEventId] = useState('wedding' in eventById ? 'wedding' : events[0].id);
  return (
    <div className="adm-grid">
      <div className="adm-toolbar no-print">
        <div className="mod-tabs">
          <button className={tab === 'catering' ? 'on' : ''} onClick={() => setTab('catering')}>Catering</button>
          <button className={tab === 'seating' ? 'on' : ''} onClick={() => setTab('seating')}>Seating</button>
        </div>
        <select className="adm-input" value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Event">
          {tab === 'seating' && <option value="">All celebrations</option>}
          {events.map((e) => <option key={e.id} value={e.id}>{EVENT_NAMES[e.id]}</option>)}
        </select>
        <button className="adm-btn primary" onClick={() => window.print()}>🖨 Print</button>
      </div>
      {tab === 'catering' ? <Catering rows={rows} eventId={eventId || 'wedding'} /> : <Seating rows={rows} eventId={eventId} reload={reload} />}
    </div>
  );
}
