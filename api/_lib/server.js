// Shared server helpers for Vercel functions (Node runtime).
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { matches, contactEmail, personalize } from '../../src/lib/audience.js';

export const SITE_URL = process.env.SITE_URL || 'https://rohit-gayathiri.vercel.app';

export function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

let transporter;
function mailer() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD are not configured');
  transporter ||= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  return transporter;
}

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const linkify = (s) => s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#cc007d">$1</a>');

function emailHtml(text, link) {
  const body = linkify(escapeHtml(text)).replace(/\n/g, '<br>');
  return `<!doctype html><html><body style="margin:0;background:#fcedc7;font-family:Georgia,serif;color:#5b0034">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fcedc7;padding:24px 12px"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff8e6;border:1px solid #ebbf38;border-radius:16px;overflow:hidden">
      <tr><td style="background:#cc007d;padding:22px;text-align:center;color:#ffde59;font-size:22px;letter-spacing:4px">ROHIT &amp; GAYATHIRI</td></tr>
      <tr><td style="padding:24px 26px;font-size:16px;line-height:1.6">${body}</td></tr>
      <tr><td style="padding:0 26px 26px;text-align:center">
        <a href="${link}" style="display:inline-block;background:#cc007d;color:#ffde59;text-decoration:none;padding:12px 26px;border-radius:999px;letter-spacing:1px">Open your invitation</a>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

/** Loads guests matching the message audience and emails each one. Returns number sent. */
export async function sendMessageEmails(sb, message) {
  const { data, error } = await sb.from('invites').select('*, rsvp:rsvps(*)');
  if (error) throw error;
  const rows = data.map((r) => ({ ...r, rsvp: Array.isArray(r.rsvp) ? r.rsvp[0] || null : r.rsvp }));
  const recipients = rows.filter((r) => matches(r, message.audience || {}) && contactEmail(r));
  const t = mailer();
  let sent = 0;
  const failures = [];
  for (const r of recipients) {
    const text = personalize(message.body, r, SITE_URL, message.audience);
    try {
      await t.sendMail({
        from: `"Rohit & Gayathiri" <${process.env.GMAIL_USER}>`,
        to: contactEmail(r),
        subject: personalize(message.subject || message.title || 'Rohit & Gayathiri', r, SITE_URL, message.audience),
        text,
        html: emailHtml(text, `${SITE_URL}/i/${r.code}`),
      });
      sent += 1;
    } catch (e) {
      failures.push(`${contactEmail(r)}: ${e.message}`);
    }
  }
  await sb.from('messages').update({
    status: failures.length && !sent ? 'failed' : 'sent',
    sent_at: new Date().toISOString(),
    sent_count: sent,
    error: failures.length ? failures.slice(0, 5).join('; ') : null,
  }).eq('id', message.id);
  return { sent, failed: failures.length };
}
