import { useMemo, useState } from 'react';
import { contactPhone } from '../lib/audience.js';
import { saveInvites } from '../lib/api.js';
import { downloadCsv } from './csv.js';
import TableFinderQr from './TableFinderQr.jsx';
import { REC_NAME, REC_VENUE, nonveg, recDate, status, total, veg } from './reception.js';

const UNASSIGNED = 'Unassigned';
const tableSort = (a, b) => (a === UNASSIGNED ? 1 : b === UNASSIGNED ? -1 : a.localeCompare(b, undefined, { numeric: true }));
const byName = (a, b) => a.family_name.localeCompare(b.family_name);

function Catering({ rows }) {
  const list = rows.filter((r) => status(r) === 'attending').sort(byName);
  const t = list.reduce((s, r) => ({ veg: s.veg + veg(r), nonveg: s.nonveg + nonveg(r) }), { veg: 0, nonveg: 0 });
  const noReply = rows.filter((r) => status(r) === 'pending').length;
  return (
    <section className="adm-card rep-sheet">
      <header className="rep-head">
        <p className="rep-kicker">Catering sheet · from RSVPs</p>
        <h2>{REC_NAME}</h2>
        <p className="adm-muted">{recDate()} · {REC_VENUE.name}, {REC_VENUE.address}</p>
        <p className="adm-muted small">Printed {new Date().toLocaleString('en-GB')}</p>
      </header>
      <div className="rep-totals">
        <div><b>{t.veg + t.nonveg}</b><span>Total guests</span></div>
        <div><b>{t.veg}</b><span>Vegetarian meals</span></div>
        <div><b>{t.nonveg}</b><span>Non-vegetarian meals</span></div>
        <div><b>{list.length}</b><span>Families attending</span></div>
      </div>
      {noReply > 0 && <p className="ci-warn no-print">⏳ {noReply} invited famil{noReply === 1 ? 'y has' : 'ies have'} not replied yet.</p>}
      <h3 className="rep-sub">Guest list</h3>
      <div className="adm-table-wrap">
        <table className="adm-table rep-table">
          <thead><tr><th>Family</th><th>Table</th><th>Vegetarian</th><th>Non-veg</th><th>Total</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.family_name}</strong>{r.rsvp?.name && r.rsvp.name !== r.family_name && <div className="adm-muted small">{r.rsvp.name}</div>}</td>
                <td>{r.table_label || '—'}</td>
                <td>{veg(r)}</td><td>{nonveg(r)}</td><td><strong>{total(r)}</strong></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={5} className="center adm-muted">No confirmed guests yet.</td></tr>}
          </tbody>
          {list.length > 0 && (
            <tfoot><tr><th>Total · {list.length} families</th><th /><th>{t.veg}</th><th>{t.nonveg}</th><th>{t.veg + t.nonveg}</th></tr></tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

function Seating({ rows, reload }) {
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [all, setAll] = useState(false);
  const list = useMemo(() => rows.filter((r) => all || status(r) === 'attending').sort(byName), [rows, all]);
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
    ['table', 'family', 'rsvp_name', 'response', 'veg', 'nonveg', 'total', 'phone'],
    ...tables.flatMap((tb) => groups[tb].map((r) => [tb === UNASSIGNED ? '' : tb, r.family_name, r.rsvp?.name || '', status(r), veg(r), nonveg(r), total(r), contactPhone(r)])),
  ]);

  return (
    <>
      <TableFinderQr />
      <section className="adm-card no-print">
        <div className="adm-card-head">
          <h2>Assign tables</h2>
          <div className="adm-toolbar">
            <label className="adm-check small"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Include families who haven’t replied</label>
            <button className="adm-btn ghost small" onClick={exportCsv}>Export seating CSV</button>
          </div>
        </div>
        <p className="adm-muted small">Type a table name (e.g. “Table 4” or “Head table”). Saves when you leave the field. Guests see it on the table finder.</p>
        <datalist id="tables">{existing.map((t) => <option key={t} value={t} />)}</datalist>
        {error && <p className="adm-error">{error}</p>}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Family</th><th>Guests</th><th>Table</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.family_name}</strong>{status(r) !== 'attending' && <span className="adm-muted small"> · {status(r) === 'declined' ? 'declined' : 'no reply'}</span>}</td>
                  <td>{status(r) === 'attending' ? <>{total(r)} <span className="adm-muted small">({veg(r)} veg · {nonveg(r)} non-veg)</span></> : '—'}</td>
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
          <h2>{REC_NAME}</h2>
        </header>
        <div className="seat-grid">
          {tables.map((tb) => {
            const heads = groups[tb].reduce((n, r) => n + total(r), 0);
            return (
              <div key={tb} className={`seat-table ${tb === UNASSIGNED ? 'unassigned' : ''}`}>
                <h3>{tb}<span>{heads} guest{heads === 1 ? '' : 's'}</span></h3>
                <ul>{groups[tb].map((r) => <li key={r.id}>{r.family_name}<span>{status(r) === 'attending' ? `${veg(r)}V · ${nonveg(r)}NV` : '—'}</span></li>)}</ul>
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
  return (
    <div className="adm-grid">
      <div className="adm-toolbar no-print">
        <div className="mod-tabs">
          <button className={tab === 'catering' ? 'on' : ''} onClick={() => setTab('catering')}>Catering</button>
          <button className={tab === 'seating' ? 'on' : ''} onClick={() => setTab('seating')}>Seating &amp; table QR</button>
        </div>
        <button className="adm-btn primary" onClick={() => window.print()}>🖨 Print {tab === 'catering' ? 'catering sheet' : 'seating plan'}</button>
      </div>
      {tab === 'catering' ? <Catering rows={rows} /> : <Seating rows={rows} reload={reload} />}
    </div>
  );
}
