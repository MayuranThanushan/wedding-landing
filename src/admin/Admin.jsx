import { useCallback, useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { DEMO, getSession, onAuthChange, signIn, signOut, sendPasswordReset, updatePassword, isAdmin, listRows, listMessages, resetDemo, adminListPhotos } from '../lib/api.js';
import Overview from './Overview.jsx';
import Guests from './Guests.jsx';
import Messages from './Messages.jsx';
import Moderation from './Moderation.jsx';
import Reports from './Reports.jsx';
import '../styles/admin.css';

function Login({ mode: initialMode = 'signin', onDone }) {
  const [mode, setMode] = useState(initialMode); // signin | forgot | sent | recover
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (mode === 'signin') await signIn(email.trim(), password);
      else if (mode === 'forgot') { await sendPasswordReset(email.trim()); setMode('sent'); }
      else if (mode === 'recover') {
        if (password.length < 8) throw new Error('Use at least 8 characters.');
        await updatePassword(password); onDone?.();
      }
    } catch (err) { setError(err.message || 'Something went wrong.'); } finally { setBusy(false); }
  };

  const titles = { signin: 'Sign in', forgot: 'Reset your password', sent: 'Check your email', recover: 'Choose a new password' };
  return (
    <div className="adm-login">
      <div className="lg-art" aria-hidden="true">
        <img src="/assets/art/mandala-gold.webp" alt="" className="lg-mandala" />
        <img src="/assets/art/ganesha-gold.webp" alt="" className="lg-ganesha" />
        <p className="lg-names">Rohit Reddy <i>&amp;</i> Gayathiri</p>
        <p className="lg-sub">Reception · 20 February 2027 · Ramada Colombo</p>
      </div>
      <form onSubmit={submit} className="lg-card" noValidate>
        <p className="lg-kicker">Guest dashboard</p>
        <h1>{titles[mode]}</h1>

        {mode === 'sent' ? (
          <>
            <p className="adm-muted">If <b>{email}</b> has dashboard access, a reset link is on its way. Open it on this device to set a new password.</p>
            <button type="button" className="adm-btn ghost" onClick={() => setMode('signin')}>← Back to sign in</button>
          </>
        ) : (
          <>
            {mode !== 'recover' && (
              <label className="adm-field"><span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" autoFocus placeholder="you@example.com" />
              </label>
            )}
            {mode !== 'forgot' && (
              <label className="adm-field"><span>{mode === 'recover' ? 'New password' : 'Password'}</span>
                <div className="lg-pw">
                  <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                    autoComplete={mode === 'recover' ? 'new-password' : 'current-password'} />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
                </div>
              </label>
            )}
            {error && <p className="adm-error" role="alert">{error}</p>}
            <button className="adm-btn primary lg-submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'forgot' ? 'Send reset link' : 'Save password'}
            </button>
            {mode === 'signin' && !DEMO && <button type="button" className="lg-link" onClick={() => { setMode('forgot'); setError(''); }}>Forgot password?</button>}
            {mode === 'forgot' && <button type="button" className="lg-link" onClick={() => { setMode('signin'); setError(''); }}>← Back to sign in</button>}
            {DEMO && mode === 'signin' && <p className="lg-demo">Demo mode: use any email with the password <b>demo</b>. Once Supabase is connected, only the accounts you create can sign in.</p>}
          </>
        )}
      </form>
    </div>
  );
}

function NoAccess({ email }) {
  return (
    <div className="adm-login">
      <div className="lg-card">
        <p className="lg-kicker">Guest dashboard</p>
        <h1>No access</h1>
        <p className="adm-muted"><b>{email}</b> is signed in but isn’t on the dashboard list. Ask the couple to add this email to <code>public.admins</code> in Supabase.</p>
        <button className="adm-btn primary" onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(0);

  const [recovering, setRecovering] = useState(false);
  const [allowed, setAllowed] = useState(undefined);

  useEffect(() => {
    document.title = 'Dashboard · Rohit Reddy & Gayathiri';
    getSession().then(setSession);
    return onAuthChange((s, event) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
    });
  }, []);

  useEffect(() => {
    if (!session) { setAllowed(undefined); return; }
    isAdmin().then(setAllowed);
  }, [session]);

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [r, m] = await Promise.all([listRows(), listMessages()]);
      setRows(r); setMessages(m);
      adminListPhotos()
        .then((p) => setPending(p.filter((x) => !x.approved).length))
        .catch(() => {});
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (session && allowed) reload(); }, [session, allowed, reload]);

  if (session === undefined) return null;
  if (recovering) return <Login mode="recover" onDone={() => setRecovering(false)} />;
  if (!session) return <Login />;
  if (allowed === undefined) return null;
  if (!allowed) return <NoAccess email={session.user?.email} />;

  const ctx = { rows, messages, reload, loading };
  return (
    <div className="adm">
      <header className="adm-head">
        <div className="adm-brand">
          <img src="/assets/art/ganesha-gold.webp" alt="" />
          <span>R <i>&amp;</i> G · Dashboard</span>
          {DEMO && <span className="adm-badge">Demo data</span>}
        </div>
        <nav className="adm-tabs">
          <NavLink end to="/admin">Overview</NavLink>
          <NavLink to="/admin/guests">Guests</NavLink>
          <NavLink to="/admin/messages">Messages</NavLink>
          <NavLink to="/admin/moderation">Moderation{pending > 0 && <span className="adm-count">{pending}</span>}</NavLink>
          <NavLink to="/admin/reports">Catering &amp; seating</NavLink>
        </nav>
        <div className="adm-head-actions">
          <button className="adm-btn ghost small" onClick={reload} disabled={loading}>{loading ? '…' : '↻ Refresh'}</button>
          {DEMO && <button className="adm-btn ghost small" onClick={() => { resetDemo(); reload(); }}>Reset demo</button>}
          <span className="adm-user" title={session.user?.email}>{session.user?.email}</span>
          <button className="adm-btn ghost small" onClick={signOut}>Sign out</button>
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
          <Route path="moderation" element={<Moderation {...ctx} onPending={setPending} />} />
          <Route path="reports" element={<Reports {...ctx} />} />
        </Routes>
      </main>
    </div>
  );
}
