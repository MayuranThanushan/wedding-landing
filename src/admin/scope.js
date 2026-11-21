// RSVP scope for the dashboard: only `rsvpEvents` (the Colombo reception) collect RSVPs.
// Every other celebration is for close family who are invited but never asked to reply —
// for those, "expected" = the seats reserved on their invite.
import { events, rsvpEvents } from '../config/wedding.js';
import { statusFor, headcount } from '../lib/audience.js';

export const RSVP_IDS = rsvpEvents;
export const isRsvpEvent = (id) => RSVP_IDS.includes(id);
export const rsvpEventList = events.filter((e) => isRsvpEvent(e.id));
export const familyEventList = events.filter((e) => !isRsvpEvent(e.id));
export const FAMILY_LABEL = 'Close family · no RSVP';

export const seats = (r) => (r.max_adults || 0) + (r.max_children || 0);
export const invitedTo = (r, id) => !!r.events?.includes(id);
/** Invited to at least one RSVP event (i.e. we expect a reply from them). */
export const needsRsvp = (r) => RSVP_IDS.some((id) => invitedTo(r, id));

/**
 * Overall RSVP status for a family, scoped to RSVP events:
 * 'attending' | 'declined' | 'pending' | 'family' (only invited to no-RSVP events).
 */
export function rsvpStatus(r) {
  if (!needsRsvp(r)) return 'family';
  const sts = RSVP_IDS.filter((id) => invitedTo(r, id)).map((id) => statusFor(r, id));
  if (sts.includes('attending')) return 'attending';
  if (sts.every((s) => s === 'declined')) return 'declined';
  return 'pending';
}
export const rsvpAttending = (r) => rsvpStatus(r) === 'attending';

/** Per-event status: RSVP events use the reply; others are 'family' when invited. */
export function eventStatus(r, id) {
  if (!invitedTo(r, id)) return 'not-invited';
  return isRsvpEvent(id) ? statusFor(r, id) : 'family';
}

/** Guests expected at an event: RSVP head count, or reserved seats for close-family events. */
export function expectedFor(r, id) {
  const st = eventStatus(r, id);
  if (st === 'attending') return headcount(r);
  if (st === 'family') return seats(r);
  return 0;
}
