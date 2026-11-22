import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EVENT_NAMES } from '../lib/audience.js';
import { adminListPhotos, setPhotoApproved, deletePhoto, photoUrl, listActivity } from '../lib/api.js';

const pendingFirst = (a, b) => (a.approved === b.approved ? (b.created_at > a.created_at ? 1 : -1) : a.approved ? 1 : -1);
const when = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)]}`;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : (w === 'child' ? 'ren' : 's')}`;

const KINDS = {
  open: { icon: '👁', label: 'Opens' },
  rsvp: { icon: '💌', label: 'RSVPs' },
  wish: { icon: '🙏', label: 'Wishes', legacy: true },
  photo: { icon: '📷', label: 'Photos' },
  song: { icon: '🎵', label: 'Songs', legacy: true },
  checkin: { icon: '🚪', label: 'Check-ins', legacy: true },
};

export function describe(a, fam) {
  const d = a.detail || {};
  switch (a.kind) {
    case 'open': return `${fam} opened their invite${d.count > 1 ? ` (${ordinal(d.count)} time)` : ''}`;
    case 'rsvp': {
      const yes = Object.values(d.attending || {}).some(Boolean);
      if (!yes) return `${fam} ${d.updated ? 'changed their RSVP to' : 'replied'}: can’t attend`;
      const n = (d.veg ?? 0) + (d.nonveg ?? 0) || (d.adults || 0) + (d.children || 0);
      const meals = d.veg != null || d.nonveg != null ? ` (${d.veg || 0} veg · ${d.nonveg || 0} non-veg)` : '';
      return `${fam} ${d.updated ? 'updated their RSVP' : 'RSVP’d'}: ${plural(n, 'guest')}${meals}`;
    }
    case 'wish': return `${d.name || fam} left a wish${d.name && d.name !== fam ? ` (${fam})` : ''}`;
    case 'photo': return `${d.name || fam} shared a photo`;
    case 'song': return `${fam} requested “${d.title || 'a song'}”`;
    case 'checkin': return `${fam} checked in at ${EVENT_NAMES[d.event] || d.event} (${(d.adults || 0) + (d.children || 0)} guests)`;
    default: return `${fam}: ${a.kind}`;
  }
}

function dayLabel(iso) {
  const d = new Date(iso); const today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function Photos({ list, refresh, fam }) {
  const [big, setBig] = useState(null);
  const act = async (fn) => { await fn(); refresh(); };
  if (!list.length) return <p className="adm-muted">No guest photos yet.</p>;
  return (
    <>
      <div className="mod-photos">
        {[...list].sort(pendingFirst).map((p) => (
          <figure key={p.id} className={p.approved ? 'approved' : 'pending'}>
            <button className="mod-thumb" onClick={() => setBig(p)}><img src={photoUrl(p)} alt={p.caption || 'Guest photo'} loading="lazy" /></button>
            <figcaption>
              <span className={`adm-pill ${p.approved ? 'sent' : 'scheduled'}`}>{p.approved ? 'Public' : 'Pending'}</span>
              <span className="small">{p.name || fam(p.invite_id)}{p.event_id ? ` · ${EVENT_NAMES[p.event_id] || p.event_id}` : ''}</span>
              {p.caption && <span className="adm-muted small">“{p.caption}”</span>}
              <span className="mod-actions">
                {p.approved
                  ? <button className="adm-btn ghost small" onClick={() => act(() => setPhotoApproved(p.id, false))}>Hide</button>
                  : <button className="adm-btn primary small" onClick={() => act(() => setPhotoApproved(p.id, true))}>Approve</button>}
                <button className="adm-btn ghost small danger" onClick={() => window.confirm('Delete this photo permanently?') && act(() => deletePhoto(p))}>Delete</button>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      {big && (
        <div className="adm-modal" onMouseDown={() => setBig(null)}>
          <img className="mod-big" src={photoUrl(big)} alt={big.caption || ''} />
        </div>
      )}
    </>
  );
}

function Activity({ list, fam }) {
  const [kind, setKind] = useState('');
  const shown = kind ? list.filter((a) => a.kind === kind) : list;
  const groups = [];
  for (const a of shown) {
    const k = dayLabel(a.created_at);
    if (groups[groups.length - 1]?.k !== k) groups.push({ k, items: [] });
    groups[groups.length - 1].items.push(a);
  }
  return (
    <>
      <div className="mod-kinds">
        <button className={!kind ? 'on' : ''} onClick={() => setKind('')}>All</button>
        {Object.entries(KINDS).filter(([, v]) => !v.legacy).map(([k, v]) => (
          <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{v.icon} {v.label}</button>
        ))}
      </div>
      {!shown.length && <p className="adm-muted">Nothing yet.</p>}
      {groups.map((g) => (
        <div key={g.k} className="feed-day">
          <h3>{g.k}</h3>
          <ul className="feed">
            {g.items.map((a) => (
              <li key={a.id}>
                <span className="feed-icon" aria-hidden="true">{KINDS[a.kind]?.icon || '•'}</span>
                <span className="feed-text">{describe(a, fam(a.invite_id))}</span>
                <time className="adm-muted small">{new Date(a.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</time>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

const TABS = ['photos', 'activity'];

export default function Moderation({ rows, onPending }) {
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'photos';
  const [data, setData] = useState({ photos: [], activity: [] });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [photos, activity] = await Promise.all([adminListPhotos(), listActivity(300)]);
      setData({ photos, activity });
      onPending?.(photos.filter((p) => !p.approved).length);
      setError('');
    } catch (e) { setError(e.message || String(e)); }
  }, [onPending]);
  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const names = useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r.family_name])), [rows]);
  const fam = (id) => names[id] || 'A guest';
  const pend = { photos: data.photos.filter((p) => !p.approved).length };

  return (
    <div className="adm-grid">
      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setParams({ tab: t })}>
            {t[0].toUpperCase() + t.slice(1)}
            {pend[t] > 0 && <span className="adm-count">{pend[t]}</span>}
          </button>
        ))}
      </div>
      {error && <p className="adm-error">{error}</p>}
      <section className="adm-card">
        {tab === 'photos' && <Photos list={data.photos} refresh={load} fam={fam} />}
        {tab === 'activity' && <><p className="adm-muted small">Newest first · refreshes every 30 seconds</p><Activity list={data.activity} fam={fam} /></>}
      </section>
    </div>
  );
}
