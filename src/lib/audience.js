// Pure helpers shared by the dashboard (browser) and the email API (Node).
// A "row" is an invite with its rsvp nested: { ...invite, rsvp: {...} | null }.
import { events, eventById, venues } from '../config/wedding.js';

export const EVENT_NAMES = {
  'bride-haldi': 'Bride’s Haldi',
  mehendi: 'Mehendi',
  'groom-haldi': 'Groom’s Haldi',
  'reception-india': 'Reception (Ballari)',
  wedding: 'Wedding Ceremony',
  'reception-colombo': 'Reception (Colombo)',
};

/** 'attending' | 'declined' | 'pending' | 'not-invited' for one event (or overall when eventId is empty). */
export function statusFor(row, eventId) {
  if (eventId) {
    if (!row.events?.includes(eventId)) return 'not-invited';
    if (!row.rsvp) return 'pending';
    const v = row.rsvp.attending?.[eventId];
    return v === true ? 'attending' : v === false ? 'declined' : 'pending';
  }
  if (!row.rsvp) return 'pending';
  return Object.values(row.rsvp.attending || {}).some(Boolean) ? 'attending' : 'declined';
}

export const headcount = (row) => (row.rsvp ? (row.rsvp.adults || 0) + (row.rsvp.children || 0) : 0);

export const EMPTY_FILTER = { q: '', event: '', status: '', food: '', side: '', tag: '' };

export function matches(row, f = {}) {
  const st = statusFor(row, f.event);
  if (f.event && st === 'not-invited') return false;
  if (f.status && st !== f.status) return false;
  if (f.food === 'veg' && !(row.rsvp?.veg > 0)) return false;
  if (f.food === 'nonveg' && !(row.rsvp?.nonveg > 0)) return false;
  if (f.food === 'allergies' && !row.rsvp?.allergies) return false;
  if (f.side && row.side !== f.side) return false;
  if (f.tag && !(row.tags || []).includes(f.tag)) return false;
  if (f.q) {
    const hay = [row.family_name, row.code, row.phone, row.email, row.rsvp?.name, row.rsvp?.phone, row.rsvp?.email, ...(row.tags || [])]
      .filter(Boolean).join(' ').toLowerCase();
    if (!hay.includes(f.q.toLowerCase())) return false;
  }
  return true;
}

export const contactEmail = (row) => row.rsvp?.email || row.email || '';
export const contactPhone = (row) => row.rsvp?.phone || row.phone || '';
export const inviteLink = (row, siteUrl) => `${String(siteUrl).replace(/\/$/, '')}/i/${row.code}`;

export function eventLine(ev) {
  const v = venues[ev.venue];
  const d = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: v.timeZone }).format(new Date(ev.start));
  const tm = ev.timeTbc
    ? (ev.part === 'morning' ? 'Morning' : 'Evening')
    : new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', timeZone: v.timeZone }).format(new Date(ev.start));
  return `• ${EVENT_NAMES[ev.id] || ev.id} — ${d}, ${tm} — ${v.name}, ${v.address}`;
}

/** Replace {name} {family} {link} {event} {events} placeholders for one guest. */
export function personalize(template, row, siteUrl, audience = {}) {
  const ids = row.rsvp ? events.filter((e) => row.rsvp.attending?.[e.id]).map((e) => e.id) : row.events || [];
  const evs = (audience.event ? [audience.event] : ids).map((id) => eventById[id]).filter(Boolean);
  return String(template)
    .replaceAll('{name}', row.rsvp?.name || row.family_name)
    .replaceAll('{family}', row.family_name)
    .replaceAll('{link}', inviteLink(row, siteUrl))
    .replaceAll('{event}', audience.event ? EVENT_NAMES[audience.event] : '')
    .replaceAll('{events}', evs.map(eventLine).join('\n'));
}

export function waLink(phone, text) {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
