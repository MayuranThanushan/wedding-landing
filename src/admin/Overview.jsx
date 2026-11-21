import { Link } from 'react-router-dom';
import { CumulativeLine, Funnel, PartBar, SERIES, NEUTRAL } from './charts.jsx';
import { REC_NAME, REC_VENUE, STATUS_LABEL, nonveg, recDate, status, total, veg } from './reception.js';

const Stat = ({ label, value, sub, to }) => {
  const body = (
    <>
      <span className="adm-stat-value">{value}</span>
      <span className="adm-stat-label">{label}</span>
      {sub && <span className="adm-stat-sub">{sub}</span>}
    </>
  );
  return to ? <Link className="adm-stat link" to={to}>{body}</Link> : <div className="adm-stat">{body}</div>;
};
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '0%');
const when = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Overview({ rows, messages }) {
  const by = { attending: [], declined: [], pending: [] };
  rows.forEach((r) => by[status(r)].push(r));
  const responded = by.attending.length + by.declined.length;
  const opened = rows.filter((r) => r.open_count > 0).length;
  const vegN = by.attending.reduce((n, r) => n + veg(r), 0);
  const nonvegN = by.attending.reduce((n, r) => n + nonveg(r), 0);

  const byDay = {};
  for (const r of rows) {
    const at = r.rsvp?.submitted_at || r.rsvp?.updated_at;
    if (at) { const k = at.slice(0, 10); byDay[k] = (byDay[k] || 0) + 1; }
  }
  let run = 0;
  const points = Object.keys(byDay).sort().map((date) => ({ date, value: (run += byDay[date]) }));
  const recent = rows.filter((r) => r.rsvp).sort((a, b) => ((b.rsvp.updated_at || '') > (a.rsvp.updated_at || '') ? 1 : -1)).slice(0, 8);

  const now = new Date();
  const waDue = messages.filter((m) => m.send_whatsapp && !m.wa_done && (m.status === 'sent' || (m.send_at && new Date(m.send_at) <= now)));

  return (
    <div className="adm-grid">
      {waDue.length > 0 && (
        <div className="adm-alert">
          📲 {waDue.length} WhatsApp message{waDue.length > 1 ? 's are' : ' is'} due: {waDue.map((m) => m.title || m.subject).join(', ')}.{' '}
          <Link to="/admin/messages">Open the WhatsApp queue →</Link>
        </div>
      )}

      <div className="adm-ov-head">
        <p className="rep-kicker">Reception RSVPs</p>
        <h1>{REC_NAME}</h1>
        <p className="adm-muted">{recDate()} · {REC_VENUE.name}</p>
      </div>

      <div className="adm-stats">
        <Stat label="Invited families" value={rows.length} to="/admin/guests" />
        <Stat label="Opened link" value={opened} sub={pct(opened, rows.length)} />
        <Stat label="Responded" value={responded} sub={pct(responded, rows.length)} />
        <Stat label="Attending" value={by.attending.length} sub="families" to="/admin/guests?status=attending" />
        <Stat label="Declined" value={by.declined.length} sub="families" to="/admin/guests?status=declined" />
        <Stat label="No reply yet" value={by.pending.length} sub="families" to="/admin/guests?status=pending" />
      </div>
      <div className="adm-stats big">
        <Stat label="Total guests" value={vegN + nonvegN} sub="veg + non-veg meals" />
        <Stat label="🥗 Vegetarian" value={vegN} sub={pct(vegN, vegN + nonvegN)} />
        <Stat label="🍗 Non-vegetarian" value={nonvegN} sub={pct(nonvegN, vegN + nonvegN)} />
      </div>

      <div className="adm-two">
        <section className="adm-card">
          <div className="adm-card-head"><h2>Responses over time</h2><span className="adm-muted small">cumulative families</span></div>
          <CumulativeLine points={points} total={rows.length} />
        </section>
        <section className="adm-card">
          <div className="adm-card-head"><h2>RSVP funnel</h2><span className="adm-muted small">families</span></div>
          <Funnel steps={[
            { label: 'Invited', value: rows.length },
            { label: 'Opened link', value: opened },
            { label: 'Responded', value: responded },
            { label: 'Attending', value: by.attending.length },
          ]} />
        </section>
      </div>

      <div className="adm-two">
        <section className="adm-card">
          <h2>Replies</h2>
          <PartBar unit="Families" parts={[
            { label: 'Attending', value: by.attending.length, color: SERIES[0] },
            { label: 'Declined', value: by.declined.length, color: SERIES[1] },
            { label: 'No reply yet', value: by.pending.length, color: NEUTRAL },
          ]} />
        </section>
        <section className="adm-card">
          <h2>Meals</h2>
          <PartBar unit="Guests" parts={[
            { label: 'Vegetarian', value: vegN, color: SERIES[0] },
            { label: 'Non-vegetarian', value: nonvegN, color: SERIES[1] },
          ]} />
        </section>
      </div>

      <section className="adm-card">
        <div className="adm-card-head"><h2>Latest replies</h2><Link className="adm-muted small" to="/admin/guests">All guests →</Link></div>
        {recent.length === 0 && <p className="adm-muted">No replies yet.</p>}
        {recent.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Family</th><th>Response</th><th>🥗 Veg</th><th>🍗 Non-veg</th><th>Total</th><th>When</th></tr></thead>
              <tbody>
                {recent.map((r) => {
                  const st = status(r);
                  return (
                    <tr key={r.id}>
                      <td><strong>{r.family_name}</strong>{r.rsvp.name && r.rsvp.name !== r.family_name && <div className="adm-muted small">{r.rsvp.name}</div>}</td>
                      <td><span className={`adm-pill st-${st}`}>{STATUS_LABEL[st]}</span></td>
                      <td>{st === 'attending' ? veg(r) : '—'}</td>
                      <td>{st === 'attending' ? nonveg(r) : '—'}</td>
                      <td><strong>{st === 'attending' ? total(r) : '—'}</strong></td>
                      <td className="small adm-muted">{r.rsvp.updated_at ? when(r.rsvp.updated_at) : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
