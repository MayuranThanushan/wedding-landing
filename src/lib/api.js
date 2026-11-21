// Data layer. Uses Supabase when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set,
// otherwise a localStorage "demo mode" so the site and dashboard can be tried immediately.
import { createClient } from '@supabase/supabase-js';
import { events } from '../config/wedding.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const DEMO = !url || !key;
export const supabase = DEMO ? null : createClient(url, key);

const ERR = {
  INVALID_CODE: 'invalid', NAME_REQUIRED: 'name', LIMIT_REACHED: 'limit', HEADCOUNT_REQUIRED: 'headcount', FOOD_MISMATCH: 'food',
};
function mapError(e) {
  const k = Object.keys(ERR).find((c) => String(e?.message || e).includes(c));
  const err = new Error(k ? ERR[k] : 'generic');
  err.cause = e;
  return err;
}

// ---------------------------------------------------------------- demo store
const DEMO_KEY = 'rg-demo-db-v3';
const RECEPTION = ['reception-colombo'];
function seed() {
  const now = new Date().toISOString();
  const inv = (code, family_name, phone, email, lang = 'en', tags = []) => ({
    id: crypto.randomUUID(), code, family_name, events: RECEPTION, phone, email, lang, tags,
    notes: '', open_count: 0, opened_at: null, created_at: now, table_label: null,
  });
  const invites = [
    inv('demo', 'Demo Family', '+94 77 000 0000', 'demo@example.com'),
    inv('kumar01', 'Kumar Family', '+94 77 123 4567', 'kumar@example.com', 'ta', ['colombo']),
    inv('perera1', 'Nimal & Anu', '+94 71 222 3333', '', 'en', ['friends']),
    inv('silva01', 'Silva Family', '+94 76 333 4444', 'silva@example.com', 'en', ['work']),
    inv('raj0001', 'Raj Uncle', '+94 76 555 1212', '', 'ta'),
    inv('nadar01', 'Nadarajah Family', '+94 77 888 9999', '', 'ta', ['family']),
  ];
  const yes = (name, phone, veg, nonveg) => ({ name, phone, email: '', attending: { 'reception-colombo': true }, adults: veg + nonveg, children: 0, veg, nonveg });
  const rsvps = {
    [invites[1].id]: yes('S. Kumar', '+94 77 123 4567', 2, 3),
    [invites[2].id]: { name: 'Nimal Perera', phone: '+94 71 222 3333', email: '', attending: { 'reception-colombo': false }, adults: 0, children: 0, veg: 0, nonveg: 0 },
    [invites[3].id]: yes('R. Silva', '+94 76 333 4444', 0, 2),
    [invites[5].id]: yes('K. Nadarajah', '+94 77 888 9999', 4, 0),
  };
  const ago = (n) => new Date(Date.now() - n * 864e5).toISOString();
  Object.values(rsvps).forEach((r, i) => { r.submitted_at = ago(12 - i * 3); r.updated_at = r.submitted_at; });
  invites.forEach((v, i) => { if (i < 5) { v.open_count = 1 + (i % 3); v.opened_at = ago(14 - i * 2); } });
  invites[1].table_label = 'Table 3';
  invites[3].table_label = 'Table 5';
  const id = () => crypto.randomUUID();
  const activity = [
    ...invites.slice(0, 5).map((v) => ({ id: id(), invite_id: v.id, kind: 'open', detail: { count: v.open_count }, created_at: v.opened_at })),
    ...Object.entries(rsvps).map(([iid, r]) => ({ id: id(), invite_id: iid, kind: 'rsvp', detail: { attending: r.attending, veg: r.veg, nonveg: r.nonveg }, created_at: r.submitted_at })),
  ];
  return { invites, rsvps, messages: [], wishes: [], photos: [], songs: [], checkins: [], activity };
}
function logDemo(d, invite_id, kind, detail = {}) {
  d.activity.push({ id: crypto.randomUUID(), invite_id, kind, detail, created_at: new Date().toISOString() });
}
function db() {
  try { const d = JSON.parse(localStorage.getItem(DEMO_KEY)); if (d) return d; } catch { /* fall through */ }
  const d = seed(); save(d); return d;
}
function save(d) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); } catch { /* ignore */ } }
export function resetDemo() { save(seed()); }
const delay = (v) => new Promise((r) => setTimeout(() => r(v), 250));

function demoSubmit(code, p) {
  const d = db();
  const inv = d.invites.find((i) => i.code === code.toLowerCase());
  if (!inv) throw new Error('INVALID_CODE');
  if (!p.name?.trim()) throw new Error('NAME_REQUIRED');
  const attending = {};
  RECEPTION.forEach((id) => { if (id in (p.attending || {})) attending[id] = !!p.attending[id]; });
  const any = Object.values(attending).some(Boolean);
  const veg = any ? Math.max(0, Math.min(30, +p.veg || 0)) : 0;
  const nonveg = any ? Math.max(0, Math.min(30, +p.nonveg || 0)) : 0;
  const r = {
    name: p.name.trim(), phone: p.phone || '', email: p.email || '', attending,
    adults: veg + nonveg, children: 0, veg, nonveg, updated_at: new Date().toISOString(),
  };
  if (any && veg + nonveg === 0) throw new Error('HEADCOUNT_REQUIRED');
  const prev = d.rsvps[inv.id];
  r.submitted_at = prev?.submitted_at || r.updated_at;
  d.rsvps[inv.id] = r;
  logDemo(d, inv.id, 'rsvp', { attending, veg: r.veg, nonveg: r.nonveg, updated: !!prev });
  save(d);
}

// ---------------------------------------------------------------- guest
export async function getInvite(code) {
  if (DEMO) {
    const d = db();
    const inv = d.invites.find((i) => i.code === String(code).toLowerCase());
    if (!inv) return delay(null);
    inv.open_count += 1; inv.opened_at ||= new Date().toISOString();
    logDemo(d, inv.id, 'open', { count: inv.open_count }); save(d);
    return delay({ ...inv, rsvp: d.rsvps[inv.id] || null });
  }
  const { data, error } = await supabase.rpc('get_invite', { p_code: code });
  if (error) throw mapError(error);
  return data;
}

export async function submitRsvp(code, payload) {
  try {
    if (DEMO) { demoSubmit(code, payload); return delay({ ok: true }); }
    const { error } = await supabase.rpc('submit_rsvp', { p_code: code, p: payload });
    if (error) throw error;
    return { ok: true };
  } catch (e) { throw mapError(e); }
}

// ---------------------------------------------------------------- admin auth
export async function getSession() {
  if (DEMO) return { user: { email: 'demo@admin' } };
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export function onAuthChange(cb) {
  if (DEMO) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_e, s) => cb(s));
  return () => data.subscription.unsubscribe();
}
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
export async function signOut() { if (!DEMO) await supabase.auth.signOut(); }

// ---------------------------------------------------------------- admin data
export async function listRows() {
  if (DEMO) { const d = db(); return delay(d.invites.map((i) => ({ ...i, rsvp: d.rsvps[i.id] || null }))); }
  const { data, error } = await supabase.from('invites').select('*, rsvp:rsvps(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ ...r, rsvp: Array.isArray(r.rsvp) ? r.rsvp[0] || null : r.rsvp }));
}

const INVITE_FIELDS = ['family_name', 'events', 'phone', 'email', 'lang', 'tags', 'notes', 'code', 'table_label'];
const pick = (o) => Object.fromEntries(INVITE_FIELDS.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const randomCode = () => Math.random().toString(36).slice(2, 10);

export async function saveInvites(list) {
  if (DEMO) {
    const d = db();
    for (const inv of list) {
      const existing = inv.id && d.invites.find((i) => i.id === inv.id);
      if (existing) Object.assign(existing, pick(inv));
      else d.invites.unshift({ id: crypto.randomUUID(), code: inv.code || randomCode(), open_count: 0, opened_at: null, created_at: new Date().toISOString(), tags: [], notes: '', ...pick(inv) });
    }
    save(d); return delay(true);
  }
  const updates = list.filter((i) => i.id);
  const inserts = list.filter((i) => !i.id).map(pick).map((i) => { if (!i.code) delete i.code; return i; });
  for (const u of updates) {
    const { error } = await supabase.from('invites').update(pick(u)).eq('id', u.id);
    if (error) throw error;
  }
  if (inserts.length) {
    const { error } = await supabase.from('invites').insert(inserts);
    if (error) throw error;
  }
  return true;
}

export async function deleteInvite(id) {
  if (DEMO) { const d = db(); d.invites = d.invites.filter((i) => i.id !== id); delete d.rsvps[id]; save(d); return delay(true); }
  const { error } = await supabase.from('invites').delete().eq('id', id);
  if (error) throw error;
}

export async function clearRsvp(id) {
  if (DEMO) { const d = db(); delete d.rsvps[id]; save(d); return delay(true); }
  const { error } = await supabase.from('rsvps').delete().eq('invite_id', id);
  if (error) throw error;
}

export async function listMessages() {
  if (DEMO) return delay([...db().messages].sort((a, b) => (b.created_at > a.created_at ? 1 : -1)));
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveMessage(m) {
  if (DEMO) {
    const d = db();
    const existing = m.id && d.messages.find((x) => x.id === m.id);
    const row = existing ? Object.assign(existing, m) : { id: crypto.randomUUID(), created_at: new Date().toISOString(), sent_count: 0, wa_done: false, ...m };
    if (!existing) d.messages.push(row);
    save(d); return delay(row);
  }
  const { id, ...rest } = m;
  const q = id ? supabase.from('messages').update(rest).eq('id', id) : supabase.from('messages').insert(rest);
  const { data, error } = await q.select().single();
  if (error) throw error;
  return data;
}

export async function deleteMessage(id) {
  if (DEMO) { const d = db(); d.messages = d.messages.filter((m) => m.id !== id); save(d); return delay(true); }
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}

/** Sends the email part of a saved message right now (server: /api/send). */
export async function sendEmailNow(messageId) {
  if (DEMO) {
    const d = db(); const m = d.messages.find((x) => x.id === messageId);
    Object.assign(m, { status: 'sent', sent_at: new Date().toISOString(), sent_count: 0, error: 'Demo mode — no emails were actually sent.' });
    save(d); return delay({ sent: 0, demo: true });
  }
  const { data } = await supabase.auth.getSession();
  const res = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` },
    body: JSON.stringify({ messageId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Send failed (${res.status})`);
  return body;
}

// ================================================================ v2 features
const demoInvite = (d, code) => {
  const inv = d.invites.find((i) => i.code === String(code || '').toLowerCase());
  if (!inv) throw mapError('INVALID_CODE');
  return inv;
};
async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw mapError(error);
  return data;
}
const BUCKET = 'guest-photos';
const byNewest = (a, b) => (b.created_at > a.created_at ? 1 : -1);

/** Public URL for a stored guest photo (demo photos are data: URLs). */
export function photoUrl(p) {
  if (!p?.path) return '';
  if (DEMO || p.path.startsWith('data:')) return p.path;
  return supabase.storage.from(BUCKET).getPublicUrl(p.path).data.publicUrl;
}

/** Downscales an image file in the browser to a JPEG Blob (small uploads, strips EXIF/location). */
export async function shrinkImage(file, max = 1600, quality = 0.82) {
  let src = await createImageBitmap(file).catch(() => null);
  let w; let h;
  if (src) { w = src.width; h = src.height; } else {
    src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
}

// ---------------------------------------------------------------- guest: wishes, photos, songs
/** Approved wishes: [{ id, name, message, created_at }] */
export async function listWishes() {
  if (DEMO) return delay(db().wishes.filter((w) => w.approved).sort(byNewest));
  return rpc('list_wishes');
}
export async function postWish(code, { name, message }) {
  if (DEMO) {
    const d = db(); const inv = demoInvite(d, code);
    if (!name?.trim() || !message?.trim()) throw mapError('NAME_REQUIRED');
    d.wishes.push({ id: crypto.randomUUID(), invite_id: inv.id, name: name.trim(), message: message.trim().slice(0, 600), approved: false, created_at: new Date().toISOString() });
    logDemo(d, inv.id, 'wish', { name }); save(d); return delay({ ok: true });
  }
  return rpc('post_wish', { p_code: code, p_name: name, p_message: message });
}

/** Approved photos: [{ id, name, path, caption, event_id, created_at }] — use photoUrl(p). */
export async function listPhotos() {
  if (DEMO) return delay(db().photos.filter((p) => p.approved).sort(byNewest));
  return rpc('list_photos');
}
/** Resizes then uploads one photo; it shows publicly once approved in the dashboard. */
export async function uploadPhoto(code, file, { name = '', caption = '', event_id = '' } = {}) {
  const blob = await shrinkImage(file, DEMO ? 900 : 1600, DEMO ? 0.7 : 0.82);
  if (DEMO) {
    const d = db(); const inv = demoInvite(d, code);
    const path = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    d.photos.push({ id: crypto.randomUUID(), invite_id: inv.id, name, path, caption, event_id, approved: false, created_at: new Date().toISOString() });
    logDemo(d, inv.id, 'photo', { name });
    save(d); return delay({ ok: true });
  }
  const path = `uploads/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw mapError(error);
  return rpc('add_photo', { p_code: code, p_name: name, p_path: path, p_caption: caption, p_event: event_id });
}

export async function requestSong(code, { name = '', title, artist = '', note = '' }) {
  if (DEMO) {
    const d = db(); const inv = demoInvite(d, code);
    if (!title?.trim()) throw mapError('NAME_REQUIRED');
    d.songs.push({ id: crypto.randomUUID(), invite_id: inv.id, name, title: title.trim(), artist, note, created_at: new Date().toISOString() });
    logDemo(d, inv.id, 'song', { title }); save(d); return delay({ ok: true });
  }
  return rpc('request_song', { p_code: code, p_name: name, p_title: title, p_artist: artist, p_note: note });
}

// ---------------------------------------------------------------- admin: moderation, activity, check-in
async function adminList(table, limit) {
  if (DEMO) return delay([...db()[table]].sort(byNewest).slice(0, limit || 100000));
  let q = supabase.from(table).select('*').order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
async function adminUpdate(table, id, patch) {
  if (DEMO) { const d = db(); const row = d[table].find((x) => x.id === id); if (row) Object.assign(row, patch); save(d); return delay(true); }
  const { error } = await supabase.from(table).update(patch).eq('id', id);
  if (error) throw error;
  return true;
}
async function adminDelete(table, id) {
  if (DEMO) { const d = db(); d[table] = d[table].filter((x) => x.id !== id); save(d); return delay(true); }
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}

/** All wishes incl. pending: [{ id, invite_id, name, message, approved, created_at }] */
export const adminListWishes = () => adminList('wishes');
export const setWishApproved = (id, approved) => adminUpdate('wishes', id, { approved });
export const deleteWish = (id) => adminDelete('wishes', id);

/** All photos incl. pending: [{ id, invite_id, name, path, caption, event_id, approved, created_at }] */
export const adminListPhotos = () => adminList('photos');
export const setPhotoApproved = (id, approved) => adminUpdate('photos', id, { approved });
export async function deletePhoto(photo) {
  if (!DEMO && photo.path) await supabase.storage.from(BUCKET).remove([photo.path]);
  return adminDelete('photos', photo.id);
}

/** [{ id, invite_id, name, title, artist, note, created_at }] */
export const adminListSongs = () => adminList('songs');
export const deleteSong = (id) => adminDelete('songs', id);

/** Newest first: [{ id, invite_id, kind: open|rsvp|wish|photo|song|checkin, detail, created_at }] */
export const listActivity = (limit = 300) => adminList('activity', limit);

/** [{ id, invite_id, event_id, adults, children, created_at }] */
export const listCheckins = () => adminList('checkins');

/** Marks a family as arrived at an event (scanning again updates the head count). */
export async function checkIn(code, eventId, { adults = 0, children = 0 } = {}) {
  if (DEMO) {
    const d = db(); const inv = demoInvite(d, code);
    const ex = d.checkins.find((c) => c.invite_id === inv.id && c.event_id === eventId);
    const now = new Date().toISOString();
    if (ex) Object.assign(ex, { adults, children, created_at: now });
    else d.checkins.push({ id: crypto.randomUUID(), invite_id: inv.id, event_id: eventId, adults, children, created_at: now });
    logDemo(d, inv.id, 'checkin', { event: eventId, adults, children }); save(d); return delay({ ok: true });
  }
  return rpc('check_in', { p_code: code, p_event: eventId, p_adults: adults, p_children: children });
}
export const undoCheckin = (id) => adminDelete('checkins', id);

/** Pulls the invite code out of a scanned QR (full /i/<code> link or a bare code). */
export function codeFromScan(text) {
  const s = String(text || '').trim();
  const m = s.match(/\/i\/([a-z0-9-]{3,40})/i);
  return (m ? m[1] : s).toLowerCase();
}


// ---------------------------------------------------------------- table finder (public, common QR at the venue)
/** Matches families attending the reception by family name, RSVP name or phone digits: [{ family_name, table_label }] */
export async function findTable(query) {
  const q = String(query || '').trim();
  if (DEMO) {
    const d = db(); const low = q.toLowerCase(); const digits = q.replace(/\D/g, '');
    const hits = d.invites.filter((i) => {
      const r = d.rsvps[i.id];
      if (!r || !Object.values(r.attending || {}).some(Boolean)) return false;
      const phones = [i.phone, r.phone].map((x) => String(x || '').replace(/\D/g, ''));
      return i.family_name.toLowerCase().includes(low) || (r.name || '').toLowerCase().includes(low)
        || (digits.length >= 6 && phones.some((ph) => ph.endsWith(digits.slice(-9))));
    });
    return delay(hits.slice(0, 8).map((i) => ({ family_name: i.family_name, table_label: i.table_label || null })));
  }
  return rpc('find_table', { p_query: q });
}
