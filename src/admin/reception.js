// The dashboard now covers one celebration: the Colombo reception (rsvpEvents[0]).
// Head count = vegetarian + non-vegetarian meals entered on the RSVP.
import { eventById, rsvpEvents, venues } from '../config/wedding.js';

export const REC = rsvpEvents[0];
export const REC_EVENT = eventById[REC];
export const REC_VENUE = venues[REC_EVENT.venue];
export const REC_NAME = 'Colombo Reception';
export const COUPLE = 'Rohit Reddy & Gayathiri';

/** 'attending' | 'declined' | 'pending' for the reception. Tolerates rows without `events`. */
export function status(r) {
  const a = r.rsvp?.attending;
  if (!r.rsvp || !a) return 'pending';
  if (a[REC] === true) return 'attending';
  if (a[REC] === false) return 'declined';
  const vals = Object.values(a);
  if (vals.some((v) => v === true)) return 'attending';
  return vals.length ? 'declined' : 'pending';
}
export const STATUS_LABEL = { attending: 'Attending', declined: 'Declined', pending: 'No reply' };

export const veg = (r) => (status(r) === 'attending' ? r.rsvp.veg || 0 : 0);
export const nonveg = (r) => (status(r) === 'attending' ? r.rsvp.nonveg || 0 : 0);
export const total = (r) => veg(r) + nonveg(r);

export const EMPTY = { q: '', status: '', food: '', tag: '' };

/** Local filter for the dashboard lists (same keys the email audience uses). */
export function filterRow(r, f = {}) {
  if (f.status && status(r) !== f.status) return false;
  if (f.food === 'veg' && !(veg(r) > 0)) return false;
  if (f.food === 'nonveg' && !(nonveg(r) > 0)) return false;
  if (f.tag && !(r.tags || []).includes(f.tag)) return false;
  if (f.q) {
    const hay = [r.family_name, r.code, r.phone, r.email, r.table_label, r.rsvp?.name, r.rsvp?.phone, r.rsvp?.email, ...(r.tags || [])]
      .filter(Boolean).join(' ').toLowerCase();
    if (!hay.includes(f.q.toLowerCase())) return false;
  }
  return true;
}

export const recDate = (opts = {}) => new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: REC_VENUE.timeZone, ...opts,
}).format(new Date(REC_EVENT.start));
