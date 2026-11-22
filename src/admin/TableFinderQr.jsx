import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { SITE_URL } from '../config/wedding.js';
import { COUPLE, REC_VENUE, recDate } from './reception.js';

export const TABLES_URL = `${String(SITE_URL).replace(/\/$/, '')}/tables`;
const DARK = '#4a0029';
const shortDate = () => recDate({ weekday: undefined, month: 'short' });

/** Renders the poster to a PNG (A-series ratio) for sharing or printing elsewhere. */
async function downloadPng() {
  const W = 1240; const H = 1754;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  await document.fonts?.ready;
  g.fillStyle = '#fffaf0'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#b8862b'; g.lineWidth = 4; g.strokeRect(50, 50, W - 100, H - 100);
  g.lineWidth = 1.5; g.strokeRect(74, 74, W - 148, H - 148);
  g.textAlign = 'center';
  g.fillStyle = '#b8862b'; g.font = '500 40px Cinzel, serif'; g.fillText('R  &  G', W / 2, 200);
  g.fillStyle = '#a3005f'; g.font = 'italic 500 128px "Cormorant Garamond", Georgia, serif'; g.fillText('Find your table', W / 2, 360);
  g.fillStyle = DARK; g.font = '500 54px "Cormorant Garamond", Georgia, serif'; g.fillText(COUPLE, W / 2, 450);
  g.fillStyle = '#8a5a72'; g.font = '34px Jost, sans-serif'; g.fillText(`Reception · ${shortDate()} · ${REC_VENUE.name}`, W / 2, 515);
  const qr = await QRCode.toDataURL(TABLES_URL, { margin: 1, width: 760, errorCorrectionLevel: 'M', color: { dark: DARK, light: '#ffffff' } });
  const img = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = qr; });
  g.fillStyle = '#fff'; g.fillRect(W / 2 - 420, 590, 840, 840);
  g.strokeStyle = '#ebbf38'; g.lineWidth = 3; g.strokeRect(W / 2 - 420, 590, 840, 840);
  g.drawImage(img, W / 2 - 380, 630, 760, 760);
  g.fillStyle = '#a3005f'; g.font = '500 58px Cinzel, serif'; g.fillText('Scan to find your table', W / 2, 1530);
  g.fillStyle = '#8a5a72'; g.font = '30px Jost, sans-serif'; g.fillText(TABLES_URL.replace(/^https?:\/\//, ''), W / 2, 1600);
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png'); a.download = 'table-finder-qr.png'; a.click();
}

/** Prints only the poster on its own A4/A5 page. */
function printPoster(size) {
  const style = document.createElement('style');
  style.textContent = `@page { size: ${size} portrait; margin: 0; }`;
  document.head.appendChild(style);
  document.documentElement.classList.add('print-poster', `poster-${size.toLowerCase()}`);
  const done = () => {
    style.remove();
    document.documentElement.classList.remove('print-poster', `poster-${size.toLowerCase()}`);
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 50);
}

export default function TableFinderQr() {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    QRCode.toString(TABLES_URL, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: DARK, light: '#0000' } }).then(setSvg).catch(() => {});
  }, []);
  return (
    <>
      <section className="adm-card tq no-print">
        <div className="tq-qr" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label="Table finder QR code" />
        <div className="tq-body">
          <h2>Table finder QR</h2>
          <p className="adm-muted">One QR for the whole reception. Guests scan it at the entrance, search their name and see their table. Tables come from the assignments below.</p>
          <p className="small"><a href={TABLES_URL} target="_blank" rel="noreferrer">{TABLES_URL}</a></p>
          <div className="adm-toolbar">
            <button className="adm-btn primary" onClick={downloadPng}>⤓ Download PNG</button>
            <button className="adm-btn ghost" onClick={() => printPoster('A4')}>🖨 Print A4 poster</button>
            <button className="adm-btn ghost" onClick={() => printPoster('A5')}>🖨 Print A5 poster</button>
          </div>
        </div>
      </section>

      {/* Only visible while printing the poster */}
      <div className="poster-sheet" aria-hidden="true">
        <div className="poster-frame">
          <p className="poster-mono">R <i>&amp;</i> G</p>
          <h1 className="poster-title">Find your table</h1>
          <p className="poster-couple">{COUPLE}</p>
          <p className="poster-meta">Reception · {shortDate()} · {REC_VENUE.name}</p>
          <div className="poster-qr" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="poster-cta">Scan to find your table</p>
          <p className="poster-url">{TABLES_URL.replace(/^https?:\/\//, '')}</p>
        </div>
      </div>
    </>
  );
}
