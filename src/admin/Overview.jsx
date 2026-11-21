import { Link } from 'react-router-dom';
import { events } from '../config/wedding.js';
import { EVENT_NAMES, statusFor, headcount } from '../lib/audience.js';

function eventStats(rows, id) {
  const s = { invited: 0, attending: 0, declined: 0, pending: 0, adults: 0, children: 0, veg: 0, nonveg: 0, maxSeats: 0 };
  for (const r of rows) {
    const st = statusFor(r, id);
    if (st === 'not-invited') continue;
    s.invited += 1;
    s.maxSeats += (r.max_adults || 0) + (r.max_children || 0);
    s[st] += 1;
    if (st === 'attending') {
      s.adults += r.rsvp.adults || 0; s.children += r.rsvp.children || 0;
      s.veg += r.rsvp.veg || 0; s.nonveg += r.rsvp.nonveg || 0;
    }
  }
  return s;
}

const Stat = ({ label, value, sub }) => (
  <div className="adm-stat">
    <span className="adm-stat-value">{value}</span>
    <span className="adm-stat-label">{label}</span>
    {sub && <span className="adm-stat-sub">{sub}</span>}
  </div>
);

export default function Overview({ rows, messages }) {
  const responded = rows.filter((r) => r.rsvp).length;
  const attending = rows.filter((r) => statusFor(r) === 'attending');
  const heads = attending.reduce((n, r) => n + headcount(r), 0);
  const opened = rows.filter((r) => r.open_count > 0).length;
  const notes = rows.filter((r) => r.rsvp?.message).sort((a, b) => (b.rsvp.updated_at > a.rsvp.updated_at ? 1 : -1));
  const allergies = rows.filter((r) => r.rsvp?.allergies && statusFor(r) === 'attending');
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

      <div className="adm-stats">
        <Stat label="Invitations" value={rows.length} sub={`${opened} opened`} />
        <Stat label="Responded" value={responded} sub={`${rows.length ? Math.round((responded / rows.length) * 100) : 0}%`} />
        <Stat label="Not responded" value={rows.length - responded} />
        <Stat label="Families attending" value={attending.length} sub={`${heads} guests`} />
      </div>

      <section className="adm-card">
        <h2>By celebration</h2>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Event</th><th>Invited</th><th>Attending</th><th>Declined</th><th>Pending</th>
                <th>Adults</th><th>Children</th><th>Total guests</th><th>🥗 Veg</th><th>🍗 Non-veg</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const s = eventStats(rows, e.id);
                return (
                  <tr key={e.id}>
                    <td><Link to={`/admin/guests?event=${e.id}&status=attending`}>{EVENT_NAMES[e.id]}</Link></td>
                    <td>{s.invited}</td>
                    <td className="ok">{s.attending}</td>
                    <td className="no">{s.declined}</td>
                    <td className="wait">{s.pending}</td>
                    <td>{s.adults}</td>
                    <td>{s.children}</td>
                    <td><strong>{s.adults + s.children}</strong> <span className="adm-muted">/ {s.maxSeats} max</span></td>
                    <td>{s.veg}</td>
                    <td>{s.nonveg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="adm-muted small">“Pending” guests count toward the max only. Tap an event to see its guest list.</p>
      </section>

      <div className="adm-two">
        <section className="adm-card">
          <h2>Wishes from guests</h2>
          {notes.length === 0 && <p className="adm-muted">No messages yet.</p>}
          <ul className="adm-notes">
            {notes.slice(0, 12).map((r) => (
              <li key={r.id}><q>{r.rsvp.message}</q><span>— {r.rsvp.name}</span></li>
            ))}
          </ul>
        </section>
        <section className="adm-card">
          <h2>Allergies &amp; dietary notes</h2>
          {allergies.length === 0 && <p className="adm-muted">None reported.</p>}
          <ul className="adm-notes">
            {allergies.map((r) => <li key={r.id}><strong>{r.rsvp.name}</strong>: {r.rsvp.allergies}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
