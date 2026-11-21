import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { SITE_URL } from '../config/wedding.js';
import { inviteLink } from '../lib/audience.js';

const base = () => (typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.host) ? window.location.origin : SITE_URL);

/** The family's entry pass QR: encodes their personal invite link, which the door scanner understands. */
export function passUrl(row) {
  return inviteLink(row, base());
}

export async function qrDataUrl(text, size = 640) {
  return QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#4a0029', light: '#ffffff' } });
}

export default function QrPassModal({ row, onClose }) {
  const [src, setSrc] = useState('');
  const url = passUrl(row);
  useEffect(() => { qrDataUrl(url).then(setSrc); }, [url]);
  const fileName = `qr-pass-${row.family_name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
  return (
    <div className="adm-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-card adm-modal-card adm-qr">
        <h2>QR entry pass</h2>
        <p className="adm-qr-family">{row.family_name}</p>
        {row.table_label && <p className="adm-muted">{row.table_label}</p>}
        {src ? <img src={src} alt={`QR code for ${row.family_name}`} width="280" height="280" /> : <div className="adm-qr-ph" />}
        <p className="adm-muted small adm-qr-url">{url}</p>
        <p className="adm-muted small">Scan it at the door from <strong>Check-in</strong>. Guests also see this pass on their invitation after they RSVP.</p>
        <div className="adm-modal-actions">
          <button type="button" className="adm-btn ghost" onClick={onClose}>Close</button>
          <a className="adm-btn primary" href={src} download={fileName} aria-disabled={!src}>Download PNG</a>
        </div>
      </div>
    </div>
  );
}
