import { events } from '../config/wedding.js';
import { EVENT_NAMES } from '../lib/audience.js';
import { RSVP_IDS, isRsvpEvent } from './scope.js';

export default function FilterBar({ value, onChange, rows, search = true }) {
  // Responses only exist for RSVP events: picking a response scopes the filter to the RSVP event,
  // and picking a close-family event clears the response filter.
  const set = (k) => (e) => {
    const next = { ...value, [k]: e.target.value };
    if (k === 'status' && next.status && !isRsvpEvent(next.event)) next.event = RSVP_IDS[0];
    if (k === 'event' && next.event && !isRsvpEvent(next.event)) next.status = '';
    onChange(next);
  };
  const familyEvent = value.event && !isRsvpEvent(value.event);
  const tags = [...new Set(rows.flatMap((r) => r.tags || []))].sort();
  return (
    <div className="adm-filters">
      {search && <input className="adm-input grow" placeholder="Search name, phone, email, code…" value={value.q} onChange={set('q')} />}
      <select className="adm-input" value={value.event} onChange={set('event')}>
        <option value="">Any event</option>
        {events.map((e) => <option key={e.id} value={e.id}>{EVENT_NAMES[e.id]}{isRsvpEvent(e.id) ? ' · RSVP' : ' · close family'}</option>)}
      </select>
      <select className="adm-input" value={value.status} onChange={set('status')} disabled={familyEvent} title={familyEvent ? 'Close-family events have no RSVP' : 'RSVP (Colombo reception)'}>
        <option value="">{familyEvent ? 'No RSVP (close family)' : 'Any RSVP response'}</option>
        <option value="attending">Attending</option>
        <option value="declined">Declined</option>
        <option value="pending">Not responded</option>
      </select>
      <select className="adm-input" value={value.food} onChange={set('food')}>
        <option value="">Any food</option>
        <option value="veg">Has vegetarian</option>
        <option value="nonveg">Has non-veg</option>
        <option value="allergies">Has allergies</option>
      </select>
      <select className="adm-input" value={value.side} onChange={set('side')}>
        <option value="">Both sides</option>
        <option value="bride">Bride’s side</option>
        <option value="groom">Groom’s side</option>
        <option value="both">Shared</option>
      </select>
      {tags.length > 0 && (
        <select className="adm-input" value={value.tag} onChange={set('tag')}>
          <option value="">Any tag</option>
          {tags.map((t) => <option key={t} value={t}>#{t}</option>)}
        </select>
      )}
    </div>
  );
}
