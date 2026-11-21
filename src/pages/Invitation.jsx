import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/index.jsx';
import { events as ALL_EVENTS } from '../config/wedding.js';
import { getInvite } from '../lib/api.js';
import Envelope from '../components/Envelope.jsx';
import Cover from '../components/Cover.jsx';
import InviteText from '../components/InviteText.jsx';
import Countdown from '../components/Countdown.jsx';
import Events from '../components/Events.jsx';
import Venues from '../components/Venues.jsx';
import Rsvp from '../components/Rsvp.jsx';
import Gallery from '../components/Gallery.jsx';
import Contact from '../components/Contact.jsx';
import LangSwitch from '../components/LangSwitch.jsx';
import MusicButton from '../components/MusicButton.jsx';
import '../styles/invitation.css';

export default function Invitation() {
  const params = useParams();
  const [search] = useSearchParams();
  const code = (params.code || search.get('g') || '').trim().toLowerCase();
  const { suggestLang } = useLang();

  const [invite, setInvite] = useState(null);
  const [status, setStatus] = useState(code ? 'loading' : 'none'); // none | loading | ok | invalid | error
  const [opened, setOpened] = useState(() => {
    try { return sessionStorage.getItem('opened') === '1'; } catch { return false; }
  });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!code) return;
    let alive = true;
    getInvite(code)
      .then((inv) => {
        if (!alive) return;
        if (!inv) return setStatus('invalid');
        setInvite(inv);
        setStatus('ok');
        suggestLang(inv.lang);
      })
      .catch(() => alive && setStatus('error'));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const visibleEvents = useMemo(
    () => (invite?.events?.length ? ALL_EVENTS.filter((e) => invite.events.includes(e.id)) : ALL_EVENTS),
    [invite],
  );

  const handleOpen = () => {
    setPlaying(true);
    try { sessionStorage.setItem('opened', '1'); } catch { /* ignore */ }
  };

  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [opened]);

  return (
    <div className="inv">
      {!opened && (
        <Envelope familyName={invite?.family_name} onOpenStart={handleOpen} onDone={() => setOpened(true)} />
      )}
      <LangSwitch />
      <MusicButton autoplay={playing} />
      <main>
        <Cover />
        <InviteText />
        <Countdown />
        <Events events={visibleEvents} />
        <Venues events={visibleEvents} />
        <Rsvp code={code} invite={invite} status={status} onSaved={(rsvp) => setInvite((i) => ({ ...i, rsvp }))} />
        <Gallery />
        <Contact />
      </main>
    </div>
  );
}
