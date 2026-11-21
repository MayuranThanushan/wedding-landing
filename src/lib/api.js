// Data layer. Uses Supabase when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set,
// otherwise a localStorage "demo mode" so the site and dashboard can be tried immediately.
import { createClient } from '@supabase/supabase-js';
import { events } from '../config/wedding.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const DEMO = !url || !key;
export const supabase = DEMO ? null : createClient(url, key);

const ERR = {
  INVALID_CODE: 'invalid', NAME_REQUIRED: 'name', HEADCOUNT_REQUIRED: 'headcount', FOOD_MISMATCH: 'food',
};
function mapError(e) {
  const k = Object.keys(ERR).find((c) => String(e?.message || e).includes(c));
  const err = new Error(k ? ERR[k] : 'generic');
  err.cause = e;
  return err;
}

// ---------------------------------------------------------------- demo store
const DEMO_KEY = 'rg-demo-db-v1';
const ALL = events.map((e) => e.id);
const INDIA = ALL.filter((id) => id !== 'reception-colombo');
function seed() {
  const now = new Date().toISOString();
  const inv = (code, family_name, side, max_adults, max_children, evs, phone, email, lang = 'en', tags = []) => ({
    id: crypto.randomUUID(), code, family_name, side, max_adults, max_children, events: evs, phone, email, lang, tags,
    notes: '', open_count: 0, opened_at: null, created_at: now,
  });
  const invites = [
    inv('demo', 'Demo Family', 'both', 3, 1, ALL, '+94 77 000 0000', 'demo@example.com'),
    inv('kumar01', 'Kumar Family', 'bride', 4, 2, ['wedding', 'reception-colombo'], '+94 77 123 4567', 'kumar@example.com', 'ta', ['colombo']),
    inv('reddy01', 'Reddy Family', 'groom', 2, 0, INDIA, '+91 98450 00001', 'reddy@example.com', 'te', ['ballari']),
    inv('perera1', 'Nimal & Anu', 'bride', 2, 0, ['reception-colombo'], '+94 71 222 3333', '', 'en', ['friends']),
    inv('sharma1', 'Sharma Family', 'groom', 3, 1, ['mehendi', 'wedding', 'reception-india'], '+91 99000 11111', 'sharma@example.com', 'en', ['work']),
    inv('raj0001', 'Raj Uncle', 'bride', 2, 0, ALL, '+94 76 555 1212', '', 'ta'),
  ];
  const rsvps = {
    [invites[1].id]: { name: 'S. Kumar', phone: '+94 77 123 4567', email: 'kumar@example.com', attending: { wedding: true, 'reception-colombo': true }, adults: 3, children: 2, veg: 2, nonveg: 3, allergies: 'Peanuts (child)', message: 'So happy for you both!', updated_at: now },
    [invites[2].id]: { name: 'V. Reddy', phone: '+91 98450 00001', email: 'reddy@example.com', attending: Object.fromEntries(INDIA.map((id) => [id, true])), adults: 2, children: 0, veg: 2, nonveg: 0, allergies: '', message: '', updated_at: now },
    [invites[3].id]: { name: 'Nimal Perera', phone: '+94 71 222 3333', email: '', attending: { 'reception-colombo': false }, adults: 0, children: 0, veg: 0, nonveg: 0, allergies: '', message: 'Sorry we will be abroad — congratulations!', updated_at: now },
    [invites[4].id]: { name: 'Anil Sharma', phone: '+91 99000 11111', email: 'sharma@example.com', attending: { mehendi: false, wedding: true, 'reception-india': true }, adults: 3, children: 1, veg: 4, nonveg: 0, allergies: '', message: '', updated_at: now },
  };
  return { invites, rsvps, messages: [] };
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
  inv.events.forEach((id) => { if (id in (p.attending || {})) attending[id] = !!p.attending[id]; });
  const any = Object.values(attending).some(Boolean);
  const r = {
    name: p.name.trim(), phone: p.phone || '', email: p.email || '', attending,
    adults: any ? Math.min(+p.adults || 0, inv.max_adults) : 0,
    children: any ? Math.min(+p.children || 0, inv.max_children) : 0,
    veg: any ? +p.veg || 0 : 0, nonveg: any ? +p.nonveg || 0 : 0,
    allergies: p.allergies || '', message: p.message || '', updated_at: new Date().toISOString(),
  };
  if (any && r.adults + r.children === 0) throw new Error('HEADCOUNT_REQUIRED');
  if (any && r.veg + r.nonveg !== r.adults + r.children) throw new Error('FOOD_MISMATCH');
  d.rsvps[inv.id] = r; save(d);
}

// ---------------------------------------------------------------- guest
export async function getInvite(code) {
  if (DEMO) {
    const d = db();
    const inv = d.invites.find((i) => i.code === String(code).toLowerCase());
    if (!inv) return delay(null);
    inv.open_count += 1; inv.opened_at ||= new Date().toISOString(); save(d);
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

const INVITE_FIELDS = ['family_name', 'side', 'max_adults', 'max_children', 'events', 'phone', 'email', 'lang', 'tags', 'notes', 'code'];
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
