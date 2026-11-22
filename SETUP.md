# Going live: step-by-step

Do these once, in order. Budget about 45 minutes. Everything here is on free plans.

---

## 1. Create the Supabase project (database + logins + photo storage)

1. Go to https://supabase.com, sign in, and click **New project**.
   - **Name:** `rohit-gayathiri`
   - **Database password:** generate one and save it in your password manager (you rarely need it).
   - **Region:** *Southeast Asia (Singapore)* or *South Asia (Mumbai)*, closest to Sri Lanka.
2. Wait for it to finish setting up (about 2 minutes).

## 2. Create the tables and functions

1. In the project, open **SQL Editor → New query**.
2. Open [supabase/schema.sql](supabase/schema.sql) in this repo, copy **all** of it, paste it in and click **Run**.
3. You should see "Success. No rows returned".
   - It's safe to run again whenever this file changes (after updates from us).
4. Check **Table Editor**: you should see `invites`, `rsvps`, `messages`, `photos`, `activity` and others.
5. Check **Storage**: there should be a bucket called `guest-photos`.

## 3. Set up the admin logins

1. **Authentication → Sign In / Providers → Email**: keep Email enabled, and **turn OFF "Allow new users to sign up"**. Only people you create can log in.
2. **Authentication → URL Configuration**:
   - **Site URL:** `https://rohit-gayathiri.vercel.app` (or your custom domain)
   - **Redirect URLs:** add `https://rohit-gayathiri.vercel.app/admin` and `http://localhost:5173/admin`.
   These are needed for the "Forgot password?" email link.
3. **Authentication → Users → Add user → Create new user**. Do this for each person who should see the dashboard:
   - enter the email and a password
   - tick **Auto Confirm User**
4. Give those emails dashboard access. Run this in **SQL Editor** (one line per person):
   ```sql
   insert into public.admins(email) values ('rohitgayathiri1803@gmail.com');
   -- insert into public.admins(email) values ('second.person@example.com');
   ```
   Someone who can sign in but isn't on this list sees a "No access" screen.

## 4. Copy the API keys

Go to **Project Settings → API Keys** (or **Data API**) and copy these into a notepad:

| What | Where it goes |
| --- | --- |
| Project URL (`https://xxxx.supabase.co`) | `VITE_SUPABASE_URL` and `SUPABASE_URL` |
| `anon` / publishable key | `VITE_SUPABASE_ANON_KEY` (safe to be public) |
| `service_role` / secret key | `SUPABASE_SERVICE_ROLE_KEY` (**secret: never share it, never put it in code**) |

## 5. Gmail for sending emails (reminders, updates)

1. Use the Gmail account that should send the emails (for example `rohitgayathiri1803@gmail.com`).
2. Turn on **2-Step Verification** at https://myaccount.google.com/security.
3. Open https://myaccount.google.com/apppasswords and create an app password called "Wedding site".
4. Copy the 16-character password. That's `GMAIL_APP_PASSWORD`; the address is `GMAIL_USER`.

## 6. Deploy on Vercel

1. Push the `wedding-site` branch to GitHub and merge it into `main` (or ask us to open the PR).
2. At https://vercel.com, open the existing project (or **Add New → Project** and import the GitHub repo).
   - **Framework:** Vite (detected automatically)
   - **Node.js version:** comes from `package.json` (`22.x`). If Vercel still complains, set **Settings → Build & Deployment → Node.js Version → 22.x**.
3. **Settings → Environment Variables**: add each of these for *Production* and *Preview*:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Project URL |
   | `SUPABASE_URL` | Project URL (same) |
   | `VITE_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `GMAIL_USER` | the Gmail address |
   | `GMAIL_APP_PASSWORD` | the 16-character app password |
   | `SITE_URL` | `https://rohit-gayathiri.vercel.app` |
   | `VITE_SITE_URL` | `https://rohit-gayathiri.vercel.app` |
   | `CRON_SECRET` | any long random text, e.g. from https://www.uuidgenerator.net |

4. **Deployments → ⋯ → Redeploy**, so the new variables are picked up.
5. **Settings → Cron Jobs**: you should see `/api/cron-reminders` (runs daily at 9:00 AM Sri Lanka time and sends scheduled emails).

## 7. Add the song

Put the reception song in `public/assets/music/the-rose.mp3`, commit and push.
- Use a file you have the right to use.
- Until the file is there, the site plays its own veena and tabla melody, so nothing breaks.

## 8. Test before sending anything

1. Open `https://rohit-gayathiri.vercel.app/admin`. You should see the login page, with no "Demo data" badge.
2. Sign in with the account from step 3.
   - Try **Forgot password?** once to check the email arrives.
3. **Guests → New invitation**: add yourself as a test family, then **Copy link** and open it on your phone.
4. Open the envelope, check the music and petals, then RSVP *yes* with 2 veg and 1 non-veg.
5. Back in the dashboard, **Overview** should show 1 attending and 3 guests.
6. **Messages**: send yourself a test email.
7. **Catering & seating**:
   - give your test family "Table 1"
   - open `https://rohit-gayathiri.vercel.app/tables`, search your name, and check that Table 1 shows
8. Delete the test family.

## 9. Send the invitations

1. **Guests → Import CSV** (download the template first), or add families one by one.
   - Set each family's language (English, Tamil or Telugu).
2. Send each family their link with the **WhatsApp** button.
3. Watch replies on **Overview**. Use **Messages → Auto reception reminders** for the 1-week and 1-day reminders.

## 10. Before the reception (by about 18 February)

1. In **Catering & seating**, assign a table to every attending family.
2. Print the **Table finder QR** poster (A4 or A5) and place it at the entrance. Guests scan it and see their table.
3. Print the **catering sheet** for the hotel (veg / non-veg / total).

---

### If something goes wrong

| Problem | Fix |
| --- | --- |
| Dashboard still shows "Demo data" | The `VITE_SUPABASE_*` variables are missing, or you didn't redeploy after adding them. |
| "No access" after signing in | Add that email to `public.admins` (step 3.4). |
| Reset-password link goes to the wrong page | Check the Site URL and Redirect URLs (step 3.2). |
| Emails don't send | Check `GMAIL_USER` and `GMAIL_APP_PASSWORD`; the app password needs 2-Step Verification on. |
| Guest link says "We couldn't find this invitation" | The code in the link doesn't match a family in **Guests**; copy the link again from the dashboard. |
