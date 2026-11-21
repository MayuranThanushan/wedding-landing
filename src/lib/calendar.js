import { venues, SITE_URL } from '../config/wedding.js';

const icsStamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => `\\${m}`);

function eventText(ev, t) {
  const v = venues[ev.venue];
  return {
    title: `${t.events[ev.id]} · Rohit & Gayathiri`,
    location: [v.name, v.address].filter(Boolean).join(', '),
    details: `${t.eventBlurbs[ev.id]}\n\n${SITE_URL}`,
  };
}

export function googleCalUrl(ev, t) {
  const { title, location, details } = eventText(ev, t);
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: title, details, location,
    dates: `${icsStamp(ev.start)}/${icsStamp(ev.end)}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

/** iCalendar file with reminders 1 week and 1 day before every event. */
export function buildIcs(events, t) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rohit & Gayathiri//Wedding//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const ev of events) {
    const { title, location, details } = eventText(ev, t);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}@rohit-gayathiri`,
      `DTSTAMP:${icsStamp(new Date().toISOString())}`,
      `DTSTART:${icsStamp(ev.start)}`,
      `DTEND:${icsStamp(ev.end)}`,
      `SUMMARY:${esc(title)}`,
      `LOCATION:${esc(location)}`,
      `DESCRIPTION:${esc(details)}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'TRIGGER:-P7D', 'END:VALARM',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'TRIGGER:-P1D', 'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(events, t, filename = 'rohit-gayathiri.ics') {
  const blob = new Blob([buildIcs(events, t)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
