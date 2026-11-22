import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n/index.jsx';
import { events as ALL_EVENTS, rsvpBy, rsvpEvents, venues } from '../config/wedding.js';
import { submitRsvp } from '../lib/api.js';
import { fmtDate } from '../lib/format.js';
import { downloadIcs, googleCalUrl } from '../lib/calendar.js';
import Reveal from './Reveal.jsx';
import Section from './ui/Section.jsx';
import { dict } from '../i18n/pick.js';
import { SHELL } from '../i18n/shell.js';

const MAX_PER_TYPE = 20;

function Stepper({ label, icon, value, min = 0, max, onChange }) {
  return (
    <div className={`meal ${value > 0 ? 'has' : ''}`}>
      <span className="meal-icon" aria-hidden="true">{icon}</span>
      <span className="meal-label">{label}</span>
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
    veg: r ? r.veg || 0 : 0,
    nonveg: r ? r.nonveg || 0 : 0,
  };
}

/** RSVP for the reception only. Head count = vegetarian + non-vegetarian meals. */
export default function Rsvp({ code, invite, status, onSaved }) {
  const { t, lang } = useLang();
  const r = t.rsvp;
  const s = dict(SHELL, lang);
  const [form, setForm] = useState(() => initialForm(invite));
  const [mode, setMode] = useState('form'); // form | thanks
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!invite) return;
    setForm(initialForm(invite));
    setMode(invite.rsvp ? 'thanks' : 'form');
  }, [invite?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const rsvpEvs = useMemo(() => ALL_EVENTS.filter((e) => rsvpEvents.includes(e.id)), []);
  const anyYes = rsvpEvs.some((e) => form.attending[e.id] === true);
  const total = form.veg + form.nonveg;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError(r.errors.name);
    if (!/^\+?[\d\s-]{8,}$/.test(form.phone.trim())) return setError(r.errors.phone);
    if (rsvpEvs.some((ev) => typeof form.attending[ev.id] !== 'boolean')) return setError(r.errors.choose);
    if (anyYes && total === 0) return setError(s.mealsError);
    setBusy(true);
    try {
      const payload = anyYes
        ? { ...form, adults: total, children: 0 }
        : { ...form, adults: 0, children: 0, veg: 0, nonveg: 0 };
      await submitRsvp(code, payload);
      onSaved?.({ ...payload, updated_at: new Date().toISOString() });
      setMode('thanks');
    } catch (err) {
      setError(err.message === 'headcount' ? s.mealsError : r.errors[err.message] || r.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  let body;
  if (!code || status === 'none') body = <p className="rsvp-note">{r.noCode}</p>;
  else if (status === 'loading') body = <p className="rsvp-note">{r.loading}</p>;
  else if (status !== 'ok') body = <p className="rsvp-note">{r.invalid}</p>;
  else if (mode === 'thanks') {
    const going = rsvpEvs.filter((e) => invite.rsvp?.attending?.[e.id]);
    const n = (invite.rsvp?.veg || 0) + (invite.rsvp?.nonveg || 0);
    body = (
      <div className="rsvp-thanks">
        <div className="rsvp-thanks-icon" aria-hidden="true">{going.length ? '💛' : '🙏'}</div>
        <p className="rsvp-thanks-text">{going.length ? r.thanksYes : r.thanksNo}</p>
        {going.length > 0 && (
          <>
            <p className="rsvp-summary">
              {r.guestsTotal(n)} · 🥗 {invite.rsvp.veg || 0} {r.veg} · 🍗 {invite.rsvp.nonveg || 0} {r.nonveg}
            </p>
            <p className="rsvp-summary">{s.tableHint}</p>
            <button className="btn btn-gold" onClick={() => downloadIcs(going, t)}>📅 {r.addAll}</button>
            <div className="rsvp-gcal">
              {going.map((e) => (
                <a key={e.id} className="chip" href={googleCalUrl(e, t)} target="_blank" rel="noreferrer">+ Google Calendar</a>
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
        <header className="rsvp-head">
          <p className="rsvp-hello">{t.dear} {invite.family_name},</p>
          {rsvpEvs.map((ev) => (
            <p className="rsvp-ev" key={ev.id}>
              {t.events[ev.id]} · {fmtDate(ev.start, t.locale, venues[ev.venue].timeZone, { weekday: 'short' })} · {venues[ev.venue].name}
            </p>
          ))}
        </header>

        {rsvpEvs.map((ev) => {
          const v = form.attending[ev.id];
          const pickAns = (val) => set({ attending: { ...form.attending, [ev.id]: val } });
          return (
            <fieldset className="rsvp-step" key={ev.id}>
              <legend><span className="rsvp-n">1</span>{r.willYouAttend}</legend>
              <div className="choice" role="radiogroup">
                <button type="button" role="radio" aria-checked={v === true} className={`choice-tile yes ${v === true ? 'on' : ''}`} onClick={() => pickAns(true)}>
                  <span className="choice-icon" aria-hidden="true">💛</span>{r.yes}
                </button>
                <button type="button" role="radio" aria-checked={v === false} className={`choice-tile no ${v === false ? 'on' : ''}`} onClick={() => pickAns(false)}>
                  <span className="choice-icon" aria-hidden="true">🙏</span>{r.no}
                </button>
              </div>
            </fieldset>
          );
        })}

        {anyYes && (
          <fieldset className="rsvp-step">
            <legend><span className="rsvp-n">2</span>{s.mealsLabel}</legend>
            <div className="meals">
              <Stepper icon="🥗" label={r.veg} value={form.veg} max={MAX_PER_TYPE} onChange={(v) => set({ veg: v })} />
              <Stepper icon="🍗" label={r.nonveg} value={form.nonveg} max={MAX_PER_TYPE} onChange={(v) => set({ nonveg: v })} />
            </div>
            <p className="rsvp-total"><span>{s.totalGuests}</span><strong>{total}</strong></p>
          </fieldset>
        )}

        <fieldset className="rsvp-step">
          <legend><span className="rsvp-n">{anyYes ? 3 : 2}</span>{s.yourDetails}</legend>
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
        </fieldset>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-pink btn-block" disabled={busy}>
          {busy ? r.sending : invite.rsvp ? r.update : r.submit}
        </button>
      </form>
    );
  }

  return (
    <Section id="rsvp" tone="cream" num="04" kicker={r.title} center className="rsvp"
      title={<>{s.rsvpTitle[0]} <em>{s.rsvpTitle[1]}</em></>}
      lead={rsvpBy && status === 'ok' ? `${r.by} ${fmtDate(`${rsvpBy}T12:00:00+05:30`, t.locale, 'Asia/Colombo')}.` : null}>
      <Reveal className="rsvp-card" variant="scale">{body}</Reveal>
    </Section>
  );
}
