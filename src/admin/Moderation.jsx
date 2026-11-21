import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EVENT_NAMES } from '../lib/audience.js';
import {
  adminListWishes, setWishApproved, deleteWish,
  adminListPhotos, setPhotoApproved, deletePhoto, photoUrl,
  adminListSongs, deleteSong, listActivity,
} from '../lib/api.js';
import { downloadCsv } from './csv.js';

const pendingFirst = (a, b) => (a.approved === b.approved ? (b.created_at > a.created_at ? 1 : -1) : a.approved ? 1 : -1);
const when = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)]}`;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : (w === 'child' ? 'ren' : 's')}`;

const KINDS = {
  open: { icon: '👁', label: 'Opens' },
  rsvp: { icon: '💌', label: 'RSVPs' },
  wish: { icon: '🙏', label: 'Wishes' },
  photo: { icon: '📷', label: 'Photos' },
  song: { icon: '🎵', label: 'Songs' },
  checkin: { icon: '🚪', label: 'Check-ins' },
};

export function describe(a, fam) {
  const d = a.detail || {};
  switch (a.kind) {
    case 'open': return `${fam} opened their invite${d.count > 1 ? ` (${ordinal(d.count)} time)` : ''}`;
    case 'rsvp': {
      const yes = Object.values(d.attending || {}).filter(Boolean).length;
      if (!yes) return `${fam} ${d.updated ? 'changed their RSVP to' : 'replied'}: can’t attend`;
      const who = [plural(d.adults || 0, 'adult'), d.children ? plural(d.children, 'child') : ''].filter(Boolean).join(' + ');
      return `${fam} ${d.updated ? 'updated their RSVP' : 'RSVP’d'}: ${who} · ${plural(yes, 'event')}`;
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

function Wishes({ list, refresh, fam }) {
  const act = async (fn) => { await fn(); refresh(); };
  if (!list.length) return <p className="adm-muted">No wishes yet. They appear here before going on the public wall.</p>;
  return (
    <ul className="mod-list">
      {[...list].sort(pendingFirst).map((w) => (
        <li key={w.id} className={w.approved ? 'approved' : 'pending'}>
          <div className="mod-body">
            <q>{w.message}</q>
            <span className="adm-muted small">— {w.name} · {fam(w.invite_id)} · {when(w.created_at)}</span>
          </div>
          <div className="mod-actions">
            <span className={`adm-pill ${w.approved ? 'sent' : 'scheduled'}`}>{w.approved ? 'On the wall' : 'Pending'}</span>
            {w.approved
              ? <button className="adm-btn ghost small" onClick={() => act(() => setWishApproved(w.id, false))}>Hide</button>
              : <button className="adm-btn primary small" onClick={() => act(() => setWishApproved(w.id, true))}>Approve</button>}
            <button className="adm-btn ghost small danger" onClick={() => window.confirm('Delete this wish?') && act(() => deleteWish(w.id))}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
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

function Songs({ list, refresh, fam }) {
  const exportCsv = () => downloadCsv('song-requests.csv', [
    ['title', 'artist', 'note', 'requested_by', 'family', 'when'],
    ...list.map((s) => [s.title, s.artist || '', s.note || '', s.name || '', fam(s.invite_id), s.created_at]),
  ]);
  if (!list.length) return <p className="adm-muted">No song requests yet.</p>;
  return (
    <>
      <div className="adm-toolbar"><button className="adm-btn ghost small" onClick={exportCsv}>Export {list.length} to CSV (for the DJ)</button></div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Song</th><th>Artist</th><th>Note</th><th>From</th><th>When</th><th /></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.title}</strong></td><td>{s.artist}</td><td className="adm-muted">{s.note}</td>
                <td>{s.name || fam(s.invite_id)}</td><td className="small adm-muted">{when(s.created_at)}</td>
                <td><button className="adm-btn ghost small danger" onClick={() => window.confirm(`Remove “${s.title}”?`) && deleteSong(s.id).then(refresh)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        {Object.entries(KINDS).map(([k, v]) => (
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

const TABS = ['wishes', 'photos', 'songs', 'activity'];

export default function Moderation({ rows, onPending }) {
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'wishes';
  const [data, setData] = useState({ wishes: [], photos: [], songs: [], activity: [] });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [wishes, photos, songs, activity] = await Promise.all([adminListWishes(), adminListPhotos(), adminListSongs(), listActivity(300)]);
      setData({ wishes, photos, songs, activity });
      onPending?.(wishes.filter((w) => !w.approved).length + photos.filter((p) => !p.approved).length);
      setError('');
    } catch (e) { setError(e.message || String(e)); }
  }, [onPending]);
  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const names = useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r.family_name])), [rows]);
  const fam = (id) => names[id] || 'A guest';
  const pend = { wishes: data.wishes.filter((w) => !w.approved).length, photos: data.photos.filter((p) => !p.approved).length };

  return (
    <div className="adm-grid">
      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setParams({ tab: t })}>
            {t[0].toUpperCase() + t.slice(1)}
            {pend[t] > 0 && <span className="adm-count">{pend[t]}</span>}
            {t === 'songs' && data.songs.length > 0 && <span className="adm-count muted">{data.songs.length}</span>}
          </button>
        ))}
      </div>
      {error && <p className="adm-error">{error}</p>}
      <section className="adm-card">
        {tab === 'wishes' && <Wishes list={data.wishes} refresh={load} fam={fam} />}
        {tab === 'photos' && <Photos list={data.photos} refresh={load} fam={fam} />}
        {tab === 'songs' && <Songs list={data.songs} refresh={load} fam={fam} />}
        {tab === 'activity' && <><p className="adm-muted small">Newest first · refreshes every 30 seconds</p><Activity list={data.activity} fam={fam} /></>}
      </section>
    </div>
  );
}
