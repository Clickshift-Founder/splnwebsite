# SPPG Public Leaders Network (SPLN)

The website and member platform of the **SPPG Public Leaders Network** — the lifelong community of graduates of the
[School of Politics, Policy & Governance](https://thesppg.org).

- **Public site:** home, about, how to join, the network, impact, events
- **Graduate Directory:** a public, verifiable register of every SPPG graduate, with search and filters
- **Graduate profiles:** claimed and edited by graduates themselves (email one-time code)
- **Spotlight:** stories of what graduates are building, with evidence
- **Insights:** articles and thought leadership by graduates, published after editorial review
- **Directors' console** (`/admin`): numbers, graduates (hide/unhide, import), Spotlight, review queue, countries & classes

Read [`CLAUDE.md`](./CLAUDE.md) (how we build), [`BRAND.md`](./BRAND.md) (how it looks and sounds) and
[`CHANGELOG.md`](./CHANGELOG.md) (what changed).

## Run locally

```bash
npm install
cp .env.example .env.local        # set AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:dev                    # terminal 1 — local Postgres (PGlite) on 127.0.0.1:54329
npm run db:migrate                # terminal 2
npm run db:seed
npm run db:import-graduates -- data/private/graduates.csv
npm run dev                       # http://localhost:3000  ·  admin: /admin
```

Or `npm run dev:local` to start the database and Next together.
Without `RESEND_API_KEY`, graduate sign-in codes print in the terminal.

> `data/private/` holds the graduate registry (emails, phones, matric numbers). It is gitignored — **never commit it.**

## Deploy (Vercel + Neon)

1. Import this repo into Vercel.
2. **Storage → Create → Neon (Postgres)** and connect it to the project. This sets `DATABASE_URL`.
3. **Storage → Create → Blob** and connect it. This sets `BLOB_READ_WRITE_TOKEN` for photo uploads.
4. **Settings → Environment Variables** (tick Production, Preview and Development for each):

   | Variable | What it is | How to get it |
   |---|---|---|
   | `AUTH_SECRET` | Signs login cookies | Any long random string. Run `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`, or use a password generator (64+ characters). Never share it. |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First director login | The email and password (10+ characters) you'll sign in to `/admin` with. Created on the first deploy. |
   | `NEXT_PUBLIC_SITE_URL` | The site's public address | e.g. `https://splnwebsite.vercel.app` now, and `https://pln.thesppg.org` once the domain is connected. |
   | `RESEND_API_KEY` | Sends graduates their sign-in codes | resend.com → sign up → **API Keys → Create** → copy the `re_…` key. |
   | `EMAIL_FROM` | Who the code emails come from | Resend → **Domains → Add domain** (e.g. `thesppg.org`) → add the DNS records it shows → once verified use `SPLN <no-reply@thesppg.org>`. Before that, Resend can only send to your own email. |

5. Redeploy. The build migrates the database, adds countries, classes, numbers, launch posts and gallery photos, and
   creates the first admin. Nothing to run by hand.
6. Sign in at `/admin` → **Graduates → Import or update from a registry CSV** → upload the graduate list.
7. Add the other directors under **Admins & security**. For a demo, use **Dashboard → Load sample content**.

### Why Neon (not Supabase)?

The app only needs Postgres. Auth (admin passwords and graduate email codes) and file storage (Vercel Blob) are already
handled, so Supabase's extra services would sit unused. Neon is provisioned inside Vercel, with one bill and env vars
injected automatically. It is serverless with scale-to-zero, and it has database branching for preview deployments.
The code also runs on any Postgres URL, including Supabase's, if you ever switch.
