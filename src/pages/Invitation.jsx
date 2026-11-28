import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/index.jsx';
import { events as ALL_EVENTS, mainEventId } from '../config/wedding.js';
import { getInvite } from '../lib/api.js';
import Envelope from '../components/Envelope.jsx';
import NavBar from '../components/shell/NavBar.jsx';
import Hero from '../components/shell/Hero.jsx';
import LiveNow from '../components/shell/LiveNow.jsx';
import InviteText from '../components/InviteText.jsx';
import Venues from '../components/Venues.jsx';
import Rsvp from '../components/Rsvp.jsx';
import Photos from '../components/community/Photos.jsx';
import Gallery from '../components/Gallery.jsx';
import Contact from '../components/Contact.jsx';
import MusicButton from '../components/MusicButton.jsx';
import PetalRain, { petalShower } from '../components/shell/PetalRain.jsx';
import '../styles/invitation.css';
import '../styles/shell.css';

const SECTIONS = ['invitation', 'venues', 'rsvp', 'photos'];

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

  // Invites are for the reception; the family ceremonies are always shown for information.
  const visibleEvents = ALL_EVENTS;

  const handleOpen = () => {
    setPlaying(true);
    setTimeout(petalShower, 900);
    try { sessionStorage.setItem('opened', '1'); } catch { /* ignore */ }
  };

  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [opened]);

  const guestCode = status === 'ok' ? code : '';
  return (
    <div className={`inv ${opened ? 'is-opened' : ''}`}>
      {!opened && (
        <Envelope familyName={invite?.family_name} onOpenStart={handleOpen} onDone={() => setOpened(true)} />
      )}
      <PetalRain />
      {opened && <NavBar sections={SECTIONS} />}
      <MusicButton autoplay={playing} />
      <LiveNow events={ALL_EVENTS.filter((e) => e.id === mainEventId)} />
      <main>
        <Hero familyName={invite?.family_name} showRsvp />
        <InviteText />
        <Venues events={visibleEvents} />
        <Rsvp code={code} invite={invite} status={status} onSaved={(rsvp) => { setInvite((i) => ({ ...i, rsvp })); if (Object.values(rsvp.attending || {}).some(Boolean)) petalShower(); }} />
        <Photos code={guestCode} invite={invite} />
        <Gallery />
      </main>
      <Contact />
    </div>
  );
}
