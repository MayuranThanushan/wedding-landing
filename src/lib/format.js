import { venues } from '../config/wedding.js';

export function fmtDate(iso, locale, timeZone, opts = {}) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone, ...opts,
  }).format(new Date(iso));
}

export function fmtTime(iso, locale, timeZone) {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone }).format(new Date(iso));
}

/** { date: "Friday, 12 February 2027", time: "Morning · time to be confirmed" | "9:00 am – 12:00 pm" } */
export function eventWhen(ev, t) {
  const v = venues[ev.venue];
  const date = fmtDate(ev.start, t.locale, v.timeZone);
  const time = ev.timeLabel
    ? ev.timeLabel[t.locale?.slice(0, 2)] || ev.timeLabel.en
    : ev.timeTbc
    ? `${t.parts[ev.part]} · ${t.timeTbc}`
    : `${fmtTime(ev.start, t.locale, v.timeZone)} – ${fmtTime(ev.end, t.locale, v.timeZone)}`;
  return { date, time };
}

export const mapsLink = (venue) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapQuery)}`;

export const mapsEmbed = (venue) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(venue.mapQuery)}&z=15&output=embed`;
