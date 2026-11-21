import { useCallback, useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { DEMO, getSession, onAuthChange, signIn, signOut, listRows, listMessages, resetDemo } from '../lib/api.js';
import Overview from './Overview.jsx';
import Guests from './Guests.jsx';
import Messages from './Messages.jsx';
import '../styles/admin.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await signIn(email, password); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="adm-login">
      <form onSubmit={submit} className="adm-card">
        <img src="/assets/art/ganesha-pink.webp" alt="" width="64" />
        <h1>Rohit &amp; Gayathiri</h1>
        <p className="adm-muted">Guest dashboard</p>
        <label className="adm-field"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label className="adm-field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Dashboard · Rohit & Gayathiri';
    getSession().then(setSession);
    return onAuthChange(setSession);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [r, m] = await Promise.all([listRows(), listMessages()]);
      setRows(r); setMessages(m);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (session) reload(); }, [session, reload]);

  if (session === undefined) return null;
  if (!session) return <Login />;

  const ctx = { rows, messages, reload, loading };
  return (
    <div className="adm">
      <header className="adm-head">
        <div className="adm-brand">
          <img src="/assets/art/ganesha-gold.webp" alt="" />
          <span>R &amp; G · Dashboard</span>
          {DEMO && <span className="adm-badge">Demo data</span>}
        </div>
        <nav className="adm-tabs">
          <NavLink end to="/admin">Overview</NavLink>
          <NavLink to="/admin/guests">Guests</NavLink>
          <NavLink to="/admin/messages">Messages</NavLink>
        </nav>
        <div className="adm-head-actions">
          <button className="adm-btn ghost small" onClick={reload} disabled={loading}>{loading ? '…' : '↻ Refresh'}</button>
          {DEMO
            ? <button className="adm-btn ghost small" onClick={() => { resetDemo(); reload(); }}>Reset demo</button>
            : <button className="adm-btn ghost small" onClick={signOut}>Sign out</button>}
        </div>
      </header>
      {DEMO && (
        <p className="adm-demo-note">
          Supabase isn’t connected yet, so this dashboard uses sample data saved in this browser. See README → “Set up Supabase”.
        </p>
      )}
      {error && <p className="adm-error adm-wrap">{error}</p>}
      <main className="adm-wrap">
        <Routes>
          <Route index element={<Overview {...ctx} />} />
          <Route path="guests" element={<Guests {...ctx} />} />
          <Route path="messages" element={<Messages {...ctx} />} />
        </Routes>
      </main>
    </div>
  );
}
