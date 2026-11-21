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
    'phone', v_inv.phone, 'email', v_inv.email,
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
  foreach k in array v_inv.events loop
    if p->'attending' ? k then
      v_att := v_att || jsonb_build_object(k, coalesce((p->'attending'->>k)::boolean, false));
      if (p->'attending'->>k)::boolean then v_any := true; end if;
    end if;
  end loop;

  v_adults   := case when v_any then greatest(0, least(coalesce((p->>'adults')::int, 0), v_inv.max_adults)) else 0 end;
  v_children := case when v_any then greatest(0, least(coalesce((p->>'children')::int, 0), v_inv.max_children)) else 0 end;
  v_veg      := case when v_any then greatest(0, coalesce((p->>'veg')::int, 0)) else 0 end;
  v_nonveg   := case when v_any then greatest(0, coalesce((p->>'nonveg')::int, 0)) else 0 end;
  if v_any and v_adults + v_children = 0 then raise exception 'HEADCOUNT_REQUIRED'; end if;
  if v_any and v_veg + v_nonveg <> v_adults + v_children then raise exception 'FOOD_MISMATCH'; end if;

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
