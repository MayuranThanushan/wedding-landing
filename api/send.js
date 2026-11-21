// POST /api/send  { messageId }  — Authorization: Bearer <admin's Supabase access token>
import { adminClient, sendMessageEmails } from './_lib/server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const sb = adminClient();
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const { data: auth, error: authErr } = await sb.auth.getUser(token);
    if (authErr || !auth?.user?.email) return res.status(401).json({ error: 'Not signed in' });
    const { data: admin } = await sb.from('admins').select('email').ilike('email', auth.user.email).maybeSingle();
    if (!admin) return res.status(403).json({ error: 'Not an admin' });

    const { messageId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { data: message, error } = await sb.from('messages').select('*').eq('id', messageId).single();
    if (error || !message) return res.status(404).json({ error: 'Message not found' });

    const result = await sendMessageEmails(sb, message);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
