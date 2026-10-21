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
4. **Settings → Environment Variables:** add `AUTH_SECRET` (random, 48+ chars), `RESEND_API_KEY`,
   `EMAIL_FROM` (a sender on a domain verified in Resend), and `NEXT_PUBLIC_SITE_URL` (e.g. `https://pln.thesppg.org`).
5. From your machine, with the Neon `DATABASE_URL` in `.env.local`:
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run db:import-graduates -- data/private/graduates.csv
   npm run admin:create -- "Director Name" director@thesppg.org "a-strong-password" super_admin
   ```
6. Deploy. Then sign in at `/admin` and add the other directors under **Admins & security**.

### Why Neon (not Supabase)?

The app only needs Postgres. Auth (admin passwords and graduate email codes) and file storage (Vercel Blob) are already
handled, so Supabase's extra services would sit unused. Neon is provisioned inside Vercel, with one bill and env vars
injected automatically. It is serverless with scale-to-zero, and it has database branching for preview deployments.
The code also runs on any Postgres URL, including Supabase's, if you ever switch.
