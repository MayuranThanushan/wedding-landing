# Rohit Reddy & Gayathiri — Wedding site

> **Going live? Follow [SETUP.md](SETUP.md) step by step.**

React + Vite site hosted on Vercel at https://rohit-gayathiri.vercel.app

| URL | What it is |
| --- | --- |
| `/i/<code>` | A guest's personal invitation to the **Colombo reception**: envelope (petal shower + veena/tabla music) → traditional invitation card → reception spotlight (family ceremonies shown for information) → venues → RSVP (veg / non-veg meal counts) → photo album |
| `/` | The same invitation without RSVP, for sharing publicly |
| `/admin` | The couple's dashboard: reception stats and charts, guest list, messages, photo moderation, catering sheet, table seating and the table-finder QR poster |
| `/tables` | Public "Find your table" page, opened from the one common QR code printed at the venue |
| `/engagement/` | The engagement site, kept as a keepsake (no form; `/rsvp.html` redirects there) |

## Editing content

- **Dates, times, venues, dress codes, contacts:** [src/config/wedding.js](src/config/wedding.js). Set `timeTbc: false` once a time is confirmed. Don't rename an event `id` after invites have gone out.
- **RSVP:** invitations are for the Colombo reception only (`rsvpEvents` / `mainEventId` in the config). The Ballari ceremonies are shown for information and handled personally. Guests give vegetarian and non-vegetarian meal counts; their total is the head count.
- **Contact numbers:** the bride's parents in `contacts` in the config. **Replace the placeholder numbers before sending invites.**
- **Venue photos:** `photo`, `photoCaption` and `photoCredit` on each venue (current photos are from Wikimedia Commons under CC BY-SA; keep the credit).
- **Text in English, Tamil and Telugu:** [src/i18n/strings.js](src/i18n/strings.js), [shell.js](src/i18n/shell.js), [community.js](src/i18n/community.js). The Tamil and Telugu text needs a native speaker to proof-read it.
- **Photos:** add them to `public/assets/gallery/` and list them in `gallery` in the config. The gallery section stays hidden while that list is empty.
- **Music:** an original festive Carnatic instrumental (veena + tabla, raga Hamsadhwani) is generated in the browser and starts when the envelope is opened; guests can mute it. To use your own track, add a licensed MP3 to `public/assets/music/` and set `music` in the config.
- **Artwork:** the motifs in `public/assets/art/` were cropped from the PDF card. To use the designer's original files, replace them using the same file names.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173/i/demo   and   http://localhost:5173/admin
```

Preview the day-of "Happening now" card with `?now=2027-02-12T10:00:00+05:30`.

Without Supabase keys, the site runs in **demo mode**: sample guests are stored in your browser and emails are only simulated.

> On the office network, Node needs to use the Windows certificate store:
> `$env:NODE_OPTIONS="--use-system-ca"; npm install`

## Set up Supabase (free tier)

1. Create a project at https://supabase.com.
2. Go to **SQL Editor**, paste [supabase/schema.sql](supabase/schema.sql) and click **Run**. It's safe to re-run, so run it again after updates; it also creates the `guest-photos` storage bucket.
3. Go to **Authentication → Users → Add user**. Create a login for each person who should see the dashboard. Then go to **Authentication → Providers → Email** and turn off **Allow new users to sign up**.
4. Give those emails dashboard access:
   ```sql
   insert into public.admins(email) values ('rohitgayathiri1803@gmail.com');
   ```
5. Go to **Project Settings → API** and copy the **URL**, the **anon** key and the **service_role** key.

## Deploy on Vercel

Add these under **Project → Settings → Environment Variables** (all are listed in [.env.example](.env.example)):

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL`, `SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | anon key (safe to be public) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**server only — never prefix with `VITE_`**) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Gmail address that sends the emails, plus a Google App Password (Google Account → Security → 2-Step Verification → App passwords) |
| `CRON_SECRET` | any long random string |
| `SITE_URL` | `https://rohit-gayathiri.vercel.app` |

Vercel detects Vite automatically (build command `npm run build`, output folder `dist`). After changing environment variables, redeploy.

## How the couple uses it

1. **Invite guests:** go to **Guests → New invitation**, or use **Import CSV** (there's a template to download). For each family, set the seat limits, which events they're invited to (all events / India only / Colombo only / pick events), their language and any tags.
2. **Send the link:** use **WhatsApp invite**, which opens WhatsApp with a personal message and link, or **Copy link**.
3. **Track responses:** **Overview** shows head counts per event, veg and non-veg counts, guests who haven't replied, allergies and guests' messages. **Guests** has filters and CSV export.
4. **Reminders and updates:** go to **Messages** and choose who gets the message (for example *Attending · Reception (Colombo) · Has vegetarian*).
   - **Email** is sent automatically, either straight away or on a schedule. Scheduled emails go out once a day at 9:00 AM India/Sri Lanka time; on Vercel's free plan cron jobs run at most once a day.
   - **WhatsApp** opens a queue. Each guest is one tap, which opens WhatsApp with their personal message ready to send. When a WhatsApp message is due, it shows up on the Overview page.
   - **+ Auto reminders for every event** creates reminders 1 week and 1 day before each event, sent to guests who are attending it.
5. **Calendar:** after RSVPing "yes", guests can add their events to Google, Apple or Outlook calendars, with alerts set 1 week and 1 day before each event.

6. **Guest photos** appear on the site only after you approve them in **Moderation**.
7. **At the venue:** in **Catering & seating**, assign each attending family a table, then print the **Table finder QR** poster. Guests scan it, type their family name or phone number and see their table.
8. **Caterer:** **Catering & seating** prints the reception catering sheet (veg / non-veg / total per family).

Gmail sends up to about 500 emails a day. Message placeholders: `{name}`, `{family}`, `{link}` (personal link), `{events}` (their events with date and venue), `{event}`.

## Secrets

No secrets are stored in git. Real values live only in `.env.local` (gitignored) and Vercel environment variables; see [.env.example](.env.example). The old EmailJS keys were purged from the git history; regenerate them in EmailJS if you still use that account.
