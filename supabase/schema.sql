-- =====================================================================
-- Rohit & Gayathiri wedding — Supabase schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Admins: emails allowed into /admin (create the same users in
-- Authentication → Users, and turn OFF "Allow new users to sign up").
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);
-- insert into public.admins(email) values ('rohitgayathiri1803@gmail.com');

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ---------------------------------------------------------------------
-- Invites: one row per family / personal link  (/i/<code>)
-- ---------------------------------------------------------------------
create table if not exists public.invites (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null default lower(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  family_name   text not null,                 -- shown as "Dear <family_name>"
  side          text not null default 'both' check (side in ('bride', 'groom', 'both')),
  max_adults    int  not null default 2 check (max_adults >= 0),
  max_children  int  not null default 0 check (max_children >= 0),
  events        text[] not null default '{}',  -- event ids from src/config/wedding.js
  phone         text,
  email         text,
  lang          text not null default 'en' check (lang in ('en', 'ta', 'te')),
  tags          text[] not null default '{}',
  notes         text,
  open_count    int not null default 0,
  opened_at     timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.invites add column if not exists table_label text;   -- seating, e.g. "Table 4"

-- ---------------------------------------------------------------------
-- RSVPs: at most one per invite (guests can edit until you lock it)
-- ---------------------------------------------------------------------
create table if not exists public.rsvps (
  invite_id     uuid primary key references public.invites(id) on delete cascade,
  name          text not null,
  phone         text,
  email         text,
  attending     jsonb not null default '{}',   -- { "<eventId>": true|false }
  adults        int not null default 0,
  children      int not null default 0,
  veg           int not null default 0,
  nonveg        int not null default 0,
  allergies     text,
  message       text,
  submitted_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Messages: broadcasts + scheduled reminders
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  title         text not null default '',
  subject       text not null default '',
  body          text not null default '',
  audience      jsonb not null default '{}',   -- same filter object as the dashboard
  send_email    boolean not null default true,
  send_whatsapp boolean not null default false,
  send_at       timestamptz,                   -- null = draft
  status        text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'failed')),
  sent_at       timestamptz,
  sent_count    int not null default 0,
  wa_done       boolean not null default false,
  error         text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row level security: guests never touch tables directly; admins can.
-- ---------------------------------------------------------------------
alter table public.admins   enable row level security;
alter table public.invites  enable row level security;
alter table public.rsvps    enable row level security;
alter table public.messages enable row level security;

drop policy if exists admin_all on public.invites;
create policy admin_all on public.invites  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all on public.rsvps;
create policy admin_all on public.rsvps    for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all on public.messages;
create policy admin_all on public.messages for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_read on public.admins;
create policy admin_read on public.admins  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- Guest RPCs (callable with the public anon key)
-- ---------------------------------------------------------------------
create or replace function public.get_invite(p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare v_inv invites; v_rsvp rsvps;
begin
  select * into v_inv from invites where code = lower(trim(p_code));
  if not found then return null; end if;
  update invites set open_count = open_count + 1, opened_at = coalesce(opened_at, now()) where id = v_inv.id;
  select * into v_rsvp from rsvps where invite_id = v_inv.id;
  return json_build_object(
    'code', v_inv.code, 'family_name', v_inv.family_name, 'max_adults', v_inv.max_adults,
    'max_children', v_inv.max_children, 'events', v_inv.events, 'lang', v_inv.lang,
    'phone', v_inv.phone, 'email', v_inv.email, 'table_label', v_inv.table_label,
    'rsvp', case when v_rsvp.invite_id is null then null else json_build_object(
      'name', v_rsvp.name, 'phone', v_rsvp.phone, 'email', v_rsvp.email, 'attending', v_rsvp.attending,
      'adults', v_rsvp.adults, 'children', v_rsvp.children, 'veg', v_rsvp.veg, 'nonveg', v_rsvp.nonveg,
      'allergies', v_rsvp.allergies, 'message', v_rsvp.message, 'updated_at', v_rsvp.updated_at) end
  );
end $$;

create or replace function public.submit_rsvp(p_code text, p jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_inv invites; v_att jsonb := '{}'; v_any boolean := false; k text;
  v_adults int; v_children int; v_veg int; v_nonveg int;
begin
  select * into v_inv from invites where code = lower(trim(p_code));
  if not found then raise exception 'INVALID_CODE'; end if;
  if coalesce(trim(p->>'name'), '') = '' then raise exception 'NAME_REQUIRED'; end if;

  -- keep only events this family is invited to
  -- Invites are for the reception; accept answers for these event ids only.
  foreach k in array array['reception-colombo'] loop
    if p->'attending' ? k then
      v_att := v_att || jsonb_build_object(k, coalesce((p->'attending'->>k)::boolean, false));
      if (p->'attending'->>k)::boolean then v_any := true; end if;
    end if;
  end loop;

  -- Head count = vegetarian + non-vegetarian meals (no adult/child split, no seat limits).
  v_veg      := case when v_any then greatest(0, least(coalesce((p->>'veg')::int, 0), 30)) else 0 end;
  v_nonveg   := case when v_any then greatest(0, least(coalesce((p->>'nonveg')::int, 0), 30)) else 0 end;
  v_adults   := v_veg + v_nonveg;
  v_children := 0;
  if v_any and v_adults = 0 then raise exception 'HEADCOUNT_REQUIRED'; end if;

  insert into rsvps as r (invite_id, name, phone, email, attending, adults, children, veg, nonveg, allergies, message)
  values (v_inv.id, trim(p->>'name'), nullif(trim(p->>'phone'), ''), nullif(trim(p->>'email'), ''), v_att,
          v_adults, v_children, v_veg, v_nonveg, nullif(trim(p->>'allergies'), ''), nullif(trim(p->>'message'), ''))
  on conflict (invite_id) do update set
    name = excluded.name, phone = excluded.phone, email = excluded.email, attending = excluded.attending,
    adults = excluded.adults, children = excluded.children, veg = excluded.veg, nonveg = excluded.nonveg,
    allergies = excluded.allergies, message = excluded.message, updated_at = now();

  return json_build_object('ok', true);
end $$;

revoke all on function public.get_invite(text) from public;
revoke all on function public.submit_rsvp(text, jsonb) from public;
grant execute on function public.get_invite(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, jsonb) to anon, authenticated;

-- =====================================================================
-- v2: wishes wall, guest photos, song requests, door check-in,
--     activity feed, seating. Safe to re-run.
-- =====================================================================
alter table public.invites add column if not exists table_label text;   -- seating, e.g. "Table 4"

create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  invite_id   uuid references public.invites(id) on delete cascade,
  name        text not null,
  message     text not null check (char_length(message) <= 600),
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  invite_id   uuid references public.invites(id) on delete cascade,
  name        text,
  path        text not null,                     -- object path in storage bucket "guest-photos"
  caption     text check (char_length(caption) <= 200),
  event_id    text,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.songs (
  id          uuid primary key default gen_random_uuid(),
  invite_id   uuid references public.invites(id) on delete cascade,
  name        text,
  title       text not null check (char_length(title) <= 120),
  artist      text check (char_length(artist) <= 120),
  note        text check (char_length(note) <= 200),
  created_at  timestamptz not null default now()
);

create table if not exists public.checkins (
  id          uuid primary key default gen_random_uuid(),
  invite_id   uuid not null references public.invites(id) on delete cascade,
  event_id    text not null,
  adults      int not null default 0,
  children    int not null default 0,
  created_at  timestamptz not null default now(),
  unique (invite_id, event_id)
);

create table if not exists public.activity (
  id          bigint generated always as identity primary key,
  invite_id   uuid references public.invites(id) on delete cascade,
  kind        text not null,                     -- open | rsvp | wish | photo | song | checkin
  detail      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists activity_created_idx on public.activity (created_at desc);

do $$ declare t text; begin
  foreach t in array array['wishes','photos','songs','checkins','activity'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format('create policy admin_all on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Storage bucket for guest photos: public read, guests may only add files under uploads/,
-- and a photo only shows on the site after you approve it in the dashboard.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guest-photos', 'guest-photos', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists guest_photo_upload on storage.objects;
create policy guest_photo_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'guest-photos' and (storage.foldername(name))[1] = 'uploads');
drop policy if exists admin_photo_delete on storage.objects;
create policy admin_photo_delete on storage.objects for delete to authenticated
  using (bucket_id = 'guest-photos' and public.is_admin());

-- Activity feed: log invite opens and RSVPs automatically
create or replace function public.log_open() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.open_count > old.open_count then
    insert into activity(invite_id, kind, detail) values (new.id, 'open', jsonb_build_object('count', new.open_count));
  end if;
  return new;
end $$;
drop trigger if exists invites_log_open on public.invites;
create trigger invites_log_open after update of open_count on public.invites
  for each row execute function public.log_open();

create or replace function public.log_rsvp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into activity(invite_id, kind, detail)
  values (new.invite_id, 'rsvp', jsonb_build_object('attending', new.attending, 'adults', new.adults,
          'children', new.children, 'updated', tg_op = 'UPDATE'));
  return new;
end $$;
drop trigger if exists rsvps_log on public.rsvps;
create trigger rsvps_log after insert or update on public.rsvps
  for each row execute function public.log_rsvp();

-- Guest RPCs (anon) ------------------------------------------------------
create or replace function public.invite_id_for(p_code text) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid;
begin
  select id into v from invites where code = lower(trim(p_code));
  if v is null then raise exception 'INVALID_CODE'; end if;
  return v;
end $$;

create or replace function public.post_wish(p_code text, p_name text, p_message text) returns json
language plpgsql security definer set search_path = public as $$
declare v uuid := invite_id_for(p_code);
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_message), '') = '' then raise exception 'NAME_REQUIRED'; end if;
  if (select count(*) from wishes where invite_id = v) >= 10 then raise exception 'LIMIT_REACHED'; end if;
  insert into wishes(invite_id, name, message) values (v, left(trim(p_name), 80), left(trim(p_message), 600));
  insert into activity(invite_id, kind, detail) values (v, 'wish', jsonb_build_object('name', left(trim(p_name), 80)));
  return json_build_object('ok', true);
end $$;

create or replace function public.list_wishes() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id', id, 'name', name, 'message', message, 'created_at', created_at)
         order by created_at desc), '[]')
  from wishes where approved;
$$;

create or replace function public.add_photo(p_code text, p_name text, p_path text, p_caption text, p_event text) returns json
language plpgsql security definer set search_path = public as $$
declare v uuid := invite_id_for(p_code);
begin
  if p_path !~ '^uploads/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$' then raise exception 'BAD_PATH'; end if;
  if (select count(*) from photos where invite_id = v) >= 60 then raise exception 'LIMIT_REACHED'; end if;
  insert into photos(invite_id, name, path, caption, event_id)
  values (v, left(trim(p_name), 80), p_path, left(trim(p_caption), 200), nullif(p_event, ''));
  insert into activity(invite_id, kind, detail) values (v, 'photo', jsonb_build_object('name', left(trim(p_name), 80)));
  return json_build_object('ok', true);
end $$;

create or replace function public.list_photos() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id', id, 'name', name, 'path', path, 'caption', caption,
         'event_id', event_id, 'created_at', created_at) order by created_at desc), '[]')
  from photos where approved;
$$;

create or replace function public.request_song(p_code text, p_name text, p_title text, p_artist text, p_note text) returns json
language plpgsql security definer set search_path = public as $$
declare v uuid := invite_id_for(p_code);
begin
  if coalesce(trim(p_title), '') = '' then raise exception 'NAME_REQUIRED'; end if;
  if (select count(*) from songs where invite_id = v) >= 15 then raise exception 'LIMIT_REACHED'; end if;
  insert into songs(invite_id, name, title, artist, note)
  values (v, left(trim(p_name), 80), left(trim(p_title), 120), left(trim(p_artist), 120), left(trim(p_note), 200));
  insert into activity(invite_id, kind, detail) values (v, 'song', jsonb_build_object('title', left(trim(p_title), 120)));
  return json_build_object('ok', true);
end $$;

-- Admin RPC: door check-in by invite code (upsert per event)
create or replace function public.check_in(p_code text, p_event text, p_adults int, p_children int) returns json
language plpgsql security definer set search_path = public as $$
declare v uuid;
begin
  if not is_admin() then raise exception 'NOT_ADMIN'; end if;
  v := invite_id_for(p_code);
  insert into checkins(invite_id, event_id, adults, children) values (v, p_event, greatest(0, p_adults), greatest(0, p_children))
  on conflict (invite_id, event_id) do update set adults = excluded.adults, children = excluded.children, created_at = now();
  insert into activity(invite_id, kind, detail) values (v, 'checkin', jsonb_build_object('event', p_event, 'adults', p_adults, 'children', p_children));
  return json_build_object('ok', true);
end $$;

do $$ declare f text; begin
  foreach f in array array['post_wish(text,text,text)', 'list_wishes()', 'add_photo(text,text,text,text,text)',
                           'list_photos()', 'request_song(text,text,text,text,text)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
  revoke all on function public.check_in(text,text,int,int) from public, anon;
  grant execute on function public.check_in(text,text,int,int) to authenticated;
  revoke all on function public.invite_id_for(text) from public, anon, authenticated;
end $$;

-- =====================================================================
-- v3: reception-only invites, table finder for the common QR at the venue
-- =====================================================================
-- Public lookup used by /tables: families attending the reception that match a
-- family name, RSVP name (3+ letters) or the last digits of a phone number (6+ digits).
create or replace function public.find_table(p_query text) returns json
language plpgsql stable security definer set search_path = public as $$
declare q text := lower(trim(coalesce(p_query, ''))); d text := regexp_replace(coalesce(p_query, ''), '\D', '', 'g');
begin
  if length(regexp_replace(q, '[^[:alnum:]]', '', 'g')) < 3 then return '[]'; end if;
  return coalesce((
    select json_agg(json_build_object('family_name', x.family_name, 'table_label', x.table_label))
    from (
      select i.family_name, i.table_label
      from invites i join rsvps r on r.invite_id = i.id
      where (r.attending ->> 'reception-colombo')::boolean
        and (lower(i.family_name) like '%' || q || '%'
          or lower(r.name) like '%' || q || '%'
          or (length(d) >= 6 and (regexp_replace(coalesce(i.phone, ''), '\D', '', 'g') like '%' || right(d, 9)
                               or regexp_replace(coalesce(r.phone, ''), '\D', '', 'g') like '%' || right(d, 9))))
      order by i.family_name
      limit 8
    ) x), '[]');
end $$;
revoke all on function public.find_table(text) from public;
grant execute on function public.find_table(text) to anon, authenticated;
