// Daily Vercel Cron (see vercel.json): emails every scheduled message whose time has come.
import { adminClient, sendMessageEmails } from './_lib/server.js';

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const sb = adminClient();
    const { data: due, error } = await sb.from('messages').select('*')
      .eq('status', 'scheduled').lte('send_at', new Date().toISOString());
    if (error) throw error;

    const results = [];
    for (const m of due) {
      if (m.send_email) {
        try {
          results.push({ id: m.id, ...(await sendMessageEmails(sb, m)) });
        } catch (e) {
          await sb.from('messages').update({ status: 'failed', error: e.message }).eq('id', m.id);
          results.push({ id: m.id, error: e.message });
        }
      } else {
        // WhatsApp-only: mark as due so it shows up in the dashboard queue.
        await sb.from('messages').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', m.id);
        results.push({ id: m.id, whatsapp: 'due' });
      }
    }
    return res.status(200).json({ processed: results.length, results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
