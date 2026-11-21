// =====================================================================
// Everything the couple may want to change lives in this file.
// Event `id`s are stored in the database (invites.events / rsvps.attending),
// so don't rename an id after invites have been sent — change the labels instead.
// Times are local to the venue (India and Sri Lanka are both UTC+05:30).
// =====================================================================

export const SITE_URL = import.meta.env?.VITE_SITE_URL || 'https://rohit-gayathiri.vercel.app';

export const couple = {
  groom: { short: 'Rohit Reddy', full: 'Rohit Sreenivas Reddy' },
  bride: { short: 'Gayathiri', full: 'Gayathiri Mayuran' },
  hashtag: '',
};

export const venues = {
  ballari: {
    name: 'Venue to be announced',
    address: 'Ballari, Karnataka, India',
    mapQuery: 'Ballari, Karnataka, India',
    timeZone: 'Asia/Kolkata',
    notes: '',
    photo: '/assets/venues/ballari.webp',
    photoCaption: 'Ballari at dusk, from the fort',
    photoCredit: 'Photo: Ravibhalli, CC BY-SA 3.0, via Wikimedia Commons',
  },
  colombo: {
    name: 'Ramada Colombo',
    address: '30 Sir Mohamed Macan Markar Mawatha, Colombo 03, Sri Lanka',
    mapQuery: 'Ramada by Wyndham Colombo',
    timeZone: 'Asia/Colombo',
    notes: '',
    photo: '/assets/venues/colombo.webp',
    photoCaption: 'Ramada Colombo',
    photoCredit: 'Photo: Rehman Abubakr, CC BY-SA 4.0, via Wikimedia Commons',
  },
};

// `timeTbc: true` shows "Morning / Evening · time to be confirmed" instead of the exact time.
// The start/end below are still used for calendar entries, so update them once confirmed.
export const events = [
  {
    id: 'bride-haldi',
    icon: '🌼',
    start: '2027-02-12T09:00:00+05:30',
    end: '2027-02-12T12:00:00+05:30',
    part: 'morning',
    timeTbc: true,
    venue: 'ballari',
    dressCode: { en: 'Shades of yellow', ta: 'மஞ்சள் நிற உடை', te: 'పసుపు రంగు దుస్తులు' },
  },
  {
    id: 'mehendi',
    icon: '🌿',
    start: '2027-02-12T17:30:00+05:30',
    end: '2027-02-12T21:30:00+05:30',
    part: 'evening',
    timeTbc: true,
    venue: 'ballari',
    dressCode: { en: 'Shades of green', ta: 'பச்சை நிற உடை', te: 'ఆకుపచ్చ రంగు దుస్తులు' },
  },
  {
    id: 'groom-haldi',
    icon: '🌻',
    start: '2027-02-13T09:00:00+05:30',
    end: '2027-02-13T12:00:00+05:30',
    part: 'morning',
    timeTbc: true,
    venue: 'ballari',
    dressCode: { en: 'Shades of yellow', ta: 'மஞ்சள் நிற உடை', te: 'పసుపు రంగు దుస్తులు' },
  },
  {
    id: 'reception-india',
    icon: '🥂',
    start: '2027-02-13T18:30:00+05:30',
    end: '2027-02-13T22:30:00+05:30',
    part: 'evening',
    timeTbc: true,
    venue: 'ballari',
    dressCode: null,
  },
  {
    id: 'wedding',
    icon: '🪔',
    start: '2027-02-14T08:00:00+05:30',
    end: '2027-02-14T12:30:00+05:30',
    part: 'morning',
    timeTbc: true,
    venue: 'ballari',
    dressCode: { en: 'Traditional attire', ta: 'பாரம்பரிய உடை', te: 'సాంప్రదాయ దుస్తులు' },
  },
  {
    id: 'reception-colombo',
    featured: true,
    icon: '✨',
    start: '2027-02-20T18:30:00+05:30',
    end: '2027-02-20T23:00:00+05:30',
    part: 'evening',
    timeTbc: true,
    venue: 'colombo',
    dressCode: null,
  },
];

// The event the whole site focuses on (hero date, countdown, RSVP, calendar).
export const mainEventId = 'reception-colombo';

// Shown on the RSVP form; set to null to hide.
export const rsvpBy = '2027-01-15';

// Shown in the contact section and on the RSVP. Fill in the real numbers before sending invites.
export const contacts = [
  { name: 'Mr. Alagaratnam Mayuran', role: { en: 'Father of the bride', ta: 'மணமகளின் தந்தை', te: 'వధువు తండ్రి' }, phone: '+94 77 000 0001' },
  { name: 'Mrs. Jayanthi Mayuran', role: { en: 'Mother of the bride', ta: 'மணமகளின் தாய்', te: 'వధువు తల్లి' }, phone: '+94 77 000 0002' },
];

// Drop photos into /public/assets/gallery and list them here — the section hides while empty.
export const gallery = [
  // { src: '/assets/gallery/01.jpg', alt: 'Rohit & Gayathiri' },
];

// Drop a licensed track into /public/assets/music and set the path — the button hides while null.
export const music = null; // '/assets/music/theme.mp3'

export const eventById = Object.fromEntries(events.map((e) => [e.id, e]));

// Only these events collect RSVPs (the rest are close-family events: invited, no RSVP needed).
export const rsvpEvents = ['reception-colombo'];
