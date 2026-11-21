import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/index.jsx';
import { events as ALL_EVENTS } from '../config/wedding.js';
import { getInvite } from '../lib/api.js';
import Envelope from '../components/Envelope.jsx';
import NavBar from '../components/shell/NavBar.jsx';
import Hero from '../components/shell/Hero.jsx';
import Marquee from '../components/shell/Marquee.jsx';
import LiveNow from '../components/shell/LiveNow.jsx';
import Story from '../components/sections/Story.jsx';
import InviteText from '../components/InviteText.jsx';
import Events from '../components/Events.jsx';
import Ceremonies from '../components/sections/Ceremonies.jsx';
import Venues from '../components/Venues.jsx';
import Travel from '../components/sections/Travel.jsx';
import Rsvp from '../components/Rsvp.jsx';
import Wishes from '../components/community/Wishes.jsx';
import Photos from '../components/community/Photos.jsx';
import Songs from '../components/community/Songs.jsx';
import Faq from '../components/sections/Faq.jsx';
import Gallery from '../components/Gallery.jsx';
import Contact from '../components/Contact.jsx';
import MusicButton from '../components/MusicButton.jsx';
import '../styles/invitation.css';
import '../styles/shell.css';

const SECTIONS = ['story', 'invitation', 'events', 'ceremonies', 'venues', 'travel', 'rsvp', 'wishes', 'photos', 'songs', 'faq'];

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

  const guestCode = status === 'ok' ? code : '';
  return (
    <div className={`inv ${opened ? 'is-opened' : ''}`}>
      {!opened && (
        <Envelope familyName={invite?.family_name} onOpenStart={handleOpen} onDone={() => setOpened(true)} />
      )}
      <NavBar sections={SECTIONS} />
      <MusicButton autoplay={playing} />
      <LiveNow events={visibleEvents} />
      <main>
        <Hero familyName={invite?.family_name} showRsvp />
        <Marquee />
        <Story />
        <InviteText />
        <Events events={visibleEvents} />
        <Ceremonies events={visibleEvents} />
        <Venues events={visibleEvents} />
        <Travel events={visibleEvents} />
        <Rsvp code={code} invite={invite} status={status} onSaved={(rsvp) => setInvite((i) => ({ ...i, rsvp }))} />
        <Wishes code={guestCode} invite={invite} />
        <Photos code={guestCode} invite={invite} />
        <Songs code={guestCode} invite={invite} />
        <Faq />
        <Gallery />
      </main>
      <Contact sections={SECTIONS} />
    </div>
  );
}
