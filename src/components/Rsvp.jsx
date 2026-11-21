import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { events as ALL_EVENTS, rsvpBy, venues } from '../config/wedding.js';
import { submitRsvp } from '../lib/api.js';
import { fmtDate } from '../lib/format.js';
import { downloadIcs, googleCalUrl } from '../lib/calendar.js';
import Reveal from './Reveal.jsx';

function Stepper({ label, value, min = 0, max, onChange }) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-ctl">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} −`}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} +`}>+</button>
      </div>
    </div>
  );
}

function initialForm(invite) {
  const r = invite?.rsvp;
  return {
    name: r?.name || '',
    phone: r?.phone || invite?.phone || '',
    email: r?.email || invite?.email || '',
    attending: r?.attending || {},
    adults: r ? r.adults : Math.min(1, invite?.max_adults ?? 1),
    children: r?.children || 0,
    veg: r?.veg || 0,
    nonveg: r ? r.nonveg : Math.min(1, invite?.max_adults ?? 1),
    allergies: r?.allergies || '',
    message: r?.message || '',
  };
}

export default function Rsvp({ code, invite, status, onSaved }) {
  const { t } = useLang();
  const r = t.rsvp;
  const [form, setForm] = useState(() => initialForm(invite));
  const [mode, setMode] = useState('form'); // form | thanks
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!invite) return;
    setForm(initialForm(invite));
    setMode(invite.rsvp ? 'thanks' : 'form');
  }, [invite?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const invitedEvents = useMemo(() => ALL_EVENTS.filter((e) => invite?.events?.includes(e.id)), [invite]);
  const anyYes = invitedEvents.some((e) => form.attending[e.id] === true);
  const total = form.adults + form.children;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // keep veg + nonveg == headcount
  const setCount = (k, v) => setForm((f) => {
    const n = { ...f, [k]: v };
    const tot = n.adults + n.children;
    if (k === 'veg') n.nonveg = tot - v;
    else if (k === 'nonveg') n.veg = tot - v;
    else { n.veg = Math.min(n.veg, tot); n.nonveg = tot - n.veg; }
    return n;
  });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError(r.errors.name);
    if (!/^\+?[\d\s-]{8,}$/.test(form.phone.trim())) return setError(r.errors.phone);
    if (invitedEvents.some((ev) => typeof form.attending[ev.id] !== 'boolean')) return setError(r.errors.choose);
    if (anyYes && total === 0) return setError(r.errors.headcount);
    if (anyYes && form.veg + form.nonveg !== total) return setError(r.errors.food);
    setBusy(true);
    try {
      const payload = anyYes ? form : { ...form, adults: 0, children: 0, veg: 0, nonveg: 0 };
      await submitRsvp(code, payload);
      onSaved?.({ ...payload, updated_at: new Date().toISOString() });
      setMode('thanks');
    } catch (err) {
      setError(r.errors[err.message] || r.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  let body;
  if (!code || status === 'none') body = <p className="rsvp-note">{r.noCode}</p>;
  else if (status === 'loading') body = <p className="rsvp-note">{r.loading}</p>;
  else if (status !== 'ok') body = <p className="rsvp-note">{r.invalid}</p>;
  else if (mode === 'thanks') {
    const going = invitedEvents.filter((e) => invite.rsvp?.attending?.[e.id]);
    body = (
      <div className="rsvp-thanks">
        <div className="rsvp-thanks-icon" aria-hidden="true">{going.length ? '💛' : '🙏'}</div>
        <p className="rsvp-thanks-text">{going.length ? r.thanksYes : r.thanksNo}</p>
        {going.length > 0 && (
          <>
            <p className="rsvp-summary">
              {going.map((e) => t.events[e.id]).join(' · ')}
              <br />
              {r.guestsTotal((invite.rsvp.adults || 0) + (invite.rsvp.children || 0))}
            </p>
            <button className="btn btn-gold" onClick={() => downloadIcs(going, t)}>📅 {r.addAll}</button>
            <div className="rsvp-gcal">
              {going.map((e) => (
                <a key={e.id} className="chip" href={googleCalUrl(e, t)} target="_blank" rel="noreferrer">+ {t.events[e.id]}</a>
              ))}
            </div>
          </>
        )}
        <button className="btn btn-ghost" onClick={() => setMode('form')}>{r.edit}</button>
      </div>
    );
  } else {
    body = (
      <form className="rsvp-form" onSubmit={submit} noValidate>
        <p className="rsvp-hello">{t.dear} <strong>{invite.family_name}</strong>,</p>
        <p className="rsvp-reserved">{r.reserved(invite.max_adults, invite.max_children)}</p>

        <fieldset className="rsvp-events">
          <legend>{r.willYouAttend}</legend>
          {invitedEvents.map((ev) => {
            const v = form.attending[ev.id];
            return (
              <div className="rsvp-event" key={ev.id}>
                <div className="rsvp-event-name">
                  <span>{ev.icon} {t.events[ev.id]}</span>
                  <small>{fmtDate(ev.start, t.locale, venues[ev.venue].timeZone, { weekday: 'short', year: undefined })}</small>
                </div>
                <div className="yesno">
                  <button type="button" className={v === true ? 'on yes' : ''} onClick={() => set({ attending: { ...form.attending, [ev.id]: true } })}>{r.yes}</button>
                  <button type="button" className={v === false ? 'on no' : ''} onClick={() => set({ attending: { ...form.attending, [ev.id]: false } })}>{r.no}</button>
                </div>
              </div>
            );
          })}
        </fieldset>

        <div className="field-grid">
          <label className="field">
            <span>{r.name} *</span>
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" required />
          </label>
          <label className="field">
            <span>{r.phone} *</span>
            <input value={form.phone} onChange={(e) => set({ phone: e.target.value.replace(/[^\d+\s-]/g, '') })} inputMode="tel" autoComplete="tel" placeholder="+94 77 123 4567" required />
            <small>{r.phoneHint}</small>
          </label>
          <label className="field">
            <span>{r.email}</span>
            <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" />
            <small>{r.emailHint}</small>
          </label>
        </div>

        {anyYes && (
          <div className="rsvp-counts">
            <div className="count-row">
              <Stepper label={r.adults} value={form.adults} max={invite.max_adults} onChange={(v) => setCount('adults', v)} />
              {invite.max_children > 0 && (
                <Stepper label={r.children} value={form.children} max={invite.max_children} onChange={(v) => setCount('children', v)} />
              )}
            </div>
            <p className="count-label">{r.food}</p>
            <div className="count-row">
              <Stepper label={`🥗 ${r.veg}`} value={form.veg} max={total} onChange={(v) => setCount('veg', v)} />
              <Stepper label={`🍗 ${r.nonveg}`} value={form.nonveg} max={total} onChange={(v) => setCount('nonveg', v)} />
            </div>
            <label className="field">
              <span>{r.allergies}</span>
              <input value={form.allergies} onChange={(e) => set({ allergies: e.target.value })} />
            </label>
          </div>
        )}

        <label className="field">
          <span>{r.message}</span>
          <textarea rows={3} value={form.message} onChange={(e) => set({ message: e.target.value })} />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-pink btn-block" disabled={busy}>
          {busy ? r.sending : invite.rsvp ? r.update : r.submit}
        </button>
      </form>
    );
  }

  return (
    <section className="rsvp" id="rsvp">
      <h2 className="section-title light">{r.title}</h2>
      {rsvpBy && status === 'ok' && (
        <p className="section-sub light">{r.by} {fmtDate(`${rsvpBy}T12:00:00+05:30`, t.locale, 'Asia/Colombo')}</p>
      )}
      <Reveal className="rsvp-card">{body}</Reveal>
    </section>
  );
}
