import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useLang } from '../../i18n/index.jsx';
import { dict } from '../../i18n/pick.js';
import { SHELL } from '../../i18n/shell.js';
import { SITE_URL, venues } from '../../config/wedding.js';
import { fmtDate } from '../../lib/format.js';

const passUrl = (code) => `${SITE_URL}/i/${code}`;

/** Draws the pass as a PNG the guest can keep in their photos. */
async function savePass({ code, family, lines, seats, table }) {
  const W = 1080; const H = 1600;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#b0006b'); bg.addColorStop(1, '#4a0029');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#ebbf38'; g.lineWidth = 3; g.strokeRect(40, 40, W - 80, H - 80);
  g.strokeStyle = 'rgba(235,191,56,.5)'; g.lineWidth = 1; g.strokeRect(56, 56, W - 112, H - 112);
  await document.fonts?.ready;
  g.textAlign = 'center'; g.fillStyle = '#ffde59';
  g.font = '500 44px Cinzel, serif'; g.fillText('ENTRY PASS', W / 2, 170);
  g.font = 'italic 500 120px "Cormorant Garamond", serif'; g.fillText('Rohit & Gayathiri', W / 2, 320);
  g.fillStyle = '#fcedc7'; g.font = '40px Jost, sans-serif'; g.fillText(family, W / 2, 400);
  const qr = await QRCode.toDataURL(passUrl(code), { margin: 1, width: 560, color: { dark: '#4a0029', light: '#fff8e6' } });
  const img = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = qr; });
  g.fillStyle = '#fff8e6'; g.fillRect(W / 2 - 300, 460, 600, 600);
  g.drawImage(img, W / 2 - 280, 480, 560, 560);
  g.fillStyle = '#ffde59'; g.font = '44px Cinzel, serif'; g.fillText(`${seats}${table ? `  ·  ${table}` : ''}`, W / 2, 1140);
  g.fillStyle = '#fcedc7'; g.font = '34px Jost, sans-serif';
  lines.slice(0, 6).forEach((l, i) => g.fillText(l, W / 2, 1220 + i * 50));
  g.fillStyle = 'rgba(255,222,89,.7)'; g.font = '28px Jost, sans-serif'; g.fillText(code.toUpperCase(), W / 2, H - 90);
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png'); a.download = `entry-pass-${code}.png`; a.click();
}

export default function EntryPass({ code, invite, going }) {
  const { t, lang } = useLang();
  const s = dict(SHELL, lang).pass;
  const [qr, setQr] = useState('');
  useEffect(() => {
    QRCode.toString(passUrl(code), { type: 'svg', margin: 0, color: { dark: '#4a0029', light: '#0000' } }).then(setQr).catch(() => {});
  }, [code]);
  const n = (invite.rsvp?.adults || 0) + (invite.rsvp?.children || 0);
  const table = invite.table_label ? `${s.table}: ${invite.table_label.replace(/^table\s*/i, '')}` : '';
  const lines = going.map((e) => `${t.events[e.id]} — ${fmtDate(e.start, t.locale, venues[e.venue].timeZone, { weekday: undefined, year: undefined, month: 'short' })}`);

  return (
    <div className="pass">
      <div className="pass-ticket">
        <div className="pass-head">
          <span className="pass-label">{s.title}</span>
          <span className="pass-names">R <i>&amp;</i> G</span>
        </div>
        <div className="pass-qr" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label="QR code" />
        <div className="pass-info">
          <strong>{invite.family_name}</strong>
          <span>{s.seats(n)}{table && ` · ${table}`}</span>
          <ul>{lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </div>
        <span className="pass-notch l" aria-hidden="true" /><span className="pass-notch r" aria-hidden="true" />
      </div>
      <p className="pass-hint">{s.hint}</p>
      <button className="btn btn-ghost" onClick={() => savePass({ code, family: invite.family_name, lines, seats: s.seats(n), table })}>⤓ {s.save}</button>
    </div>
  );
}
