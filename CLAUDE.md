# CLAUDE.md — SPLN Website Build Guide

Operating manual for anyone (human or AI) building on this repo. **Read this first, every session.**
Companion docs: [`BRAND.md`](./BRAND.md) (visual + voice rules) · [`CHANGELOG.md`](./CHANGELOG.md) (what changed, when).

---

## 1. What this is

The website and member platform of the **SPPG Public Leaders Network (SPLN)** — the lifelong graduate
community of the **School of Politics, Policy & Governance** (thesppg.org). SPPG is the parent body; SPLN
inherits its brand.

The site has two jobs, in this order:
1. **Make SPLN irresistible and credible** — show the calibre, reach and public impact of the graduates,
   and point every visitor to the *only* door in: **apply to SPPG → be admitted → complete the 10-month
   programme → graduate → SLT attests Character, Competence & Capacity (3Cs Index) above threshold →
   inducted into SPLN.**
2. **Run the community** — a public, verifiable graduate directory; graduate-owned profiles; Spotlight
   stories; member-submitted, admin-approved articles; director-editable numbers.

Countries today: 🇳🇬 Nigeria (6 cohorts, since 2021) · 🇸🇳 Senegal (pioneer class 2025) · 🇰🇪 Kenya
(pioneer class 2026) · 🇬🇭 Ghana (admissions in progress, no graduates yet). **Built to expand** — new
countries and cohorts are rows in the database, never code changes.

## 2. Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript (strict) | Server Components by default; `"use client"` only for interactivity |
| Styling | Tailwind CSS v4 (`src/app/globals.css` `@theme` tokens) | Tokens mirror BRAND.md — never hard-code hex in components |
| DB | Postgres via Drizzle ORM | **Prod: Neon** (Neon URL → `neon-http` driver). **Local: PGlite** served by `npm run db:dev` on 127.0.0.1:54329 (`postgres.js` driver) when `DATABASE_URL` is empty |
| Auth | Signed JWT cookies (`jose`) | Admin: email + bcrypt password. Graduates: email one-time code |
| Email | Resend HTTP API | No key → codes print to server console (dev only) |
| Uploads | Vercel Blob | No token → `public/uploads/` (dev only) |
| Hosting | Vercel | |

## 3. Commands

```bash
npm run dev:local           # starts the local DB (db:dev) + Next on http://localhost:3000
npm run db:dev              # local Postgres (PGlite) only — needed by dev and all db:* scripts
npm run dev                 # Next only (DB must already be running, or DATABASE_URL set)
npm run build && npm start  # production build check — run before every push (prebuild runs predeploy; no-op locally)
npm run typecheck           # tsc --noEmit
npm run lint

npm run db:generate         # after editing src/db/schema.ts → creates drizzle/NNNN_*.sql
npm run db:migrate          # applies migrations to DATABASE_URL (or the local db:dev server)
npm run db:seed             # countries, cohorts, stats, launch posts, first admin (idempotent)
npm run db:import-graduates -- data/private/graduates.csv   # upsert registry (idempotent, by email)
npm run admin:create -- "Name" email "password" [super_admin|editor]
npm run map:build           # regenerate src/content/africa-dots.json (only when adding map features)
```

On this Windows machine Node is portable: `export PATH="$HOME/.local/node-v22.20.0-win-x64:$PATH"` (bash).

**Never open `.data/pglite` in-process from the app.** Embedded PGlite crashed (WASM `Aborted()`) under Next dev's concurrent load; it now runs as its own process (`scripts/dev-db.mjs`) behind a Postgres socket, so dev, scripts and tests can all connect at once.

First-time local setup: `npm i` → `cp .env.example .env.local` (set AUTH_SECRET, ADMIN_*) → `npm run db:dev` (leave running) → `npm run db:migrate && npm run db:seed && npm run db:import-graduates` → `npm run dev`.

## 4. Repository map

```
src/
  app/
    (site)/            public website (shared header/footer layout)
      page.tsx         home
      about/ join/ network/ impact/ graduates/ spotlight/ insights/ gallery/ events/ write/ member/
    admin/             director console (protected by middleware + requireAdmin())
    api/upload/        image upload endpoint (admin or verified graduate)
  components/          UI building blocks (site/, admin/, ui/)
  content/             static copy (site.ts) + africa-dots.json — edit copy here, not in JSX
  db/                  schema.ts (source of truth), connect.ts, index.ts
  lib/                 auth, queries, actions helpers, email, storage, text, csv, import
  middleware.ts        guards /admin/* and /member/*
scripts/               predeploy (runs on every Vercel build), dev-db, dev-local, migrate, seed, import-graduates, create-admin, build-africa-dots
drizzle/               generated SQL migrations (commit these)
data/private/          graduate registry CSV — GITIGNORED, NEVER COMMIT
```

## 5. Non-negotiable rules

### Privacy (the registry holds real people's emails, phones, matric numbers)
- `data/private/` and `*.csv` are gitignored. **Never commit registry data. Never paste it into code, seeds, fixtures or docs.**
- Public queries select only `publicGraduateColumns` (`src/lib/queries.ts`). `email`, `altEmails`, `phone`,
  `matricNumber`, `stateOfResidence` must never reach a public page, client component, API response, or log.
- Hidden graduates (`isHidden`) never appear in public listings, search, counts of *listed* members, or profile URLs (404).
  Total graduate *counts* include hidden people — hiding is about display, not erasure.
- Verification errors must not reveal whether an email exists elsewhere in the registry.

### Security
- Every server action / route handler that mutates re-checks the session (`requireAdmin()` / `requireMember()`),
  even though middleware also guards the route. Middleware is a convenience, not the boundary.
- Graduates may only edit **their own** profile and **their own** non-published posts.
- Markdown is rendered with `react-markdown` without `rehype-raw` — never enable raw HTML.
- Uploads: images only (jpeg/png/webp/avif), ≤ 5 MB, server-validated.
- Rate-limit one-time codes: max 3 sends / 15 min per graduate, 5 attempts per code, 15-minute expiry.

### Data model
- `src/db/schema.ts` is the source of truth. Change it → `npm run db:generate` → commit the SQL in `drizzle/`.
  Never hand-edit applied migrations.
- **neon-http has no interactive transactions.** Write idempotent, ordered statements instead.
- Countries/cohorts live in the DB. Never `if (country === "NG")` in UI code — read from `countries`/`cohorts`.
- Graduate totals are **computed** from the `graduates` table. Public-office numbers are **director-edited** in `stats`.
- **Every Vercel deploy runs `scripts/predeploy.ts`** (migrations + `seedBaseline`). Therefore the baseline seed must stay
  **insert-only**: never update or re-create rows directors may have edited or deleted.
- **Sample content** (`src/lib/samples.ts`) is fictional demo data: always `isSample = true`, always shown with `<SampleBadge />`,
  never counted in totals, never in the sitemap. Sample personas must not share a full name with anyone on the register.
- Uploads: compress in the browser (`compressImage` in `components/ui/image-upload.tsx`) — Vercel rejects request bodies > 4.5 MB.

### Content & editorial
- All prose copy lives in `src/content/site.ts` (or the DB). Components render; they don't author.
- Don't invent facts, quotes, or stories about real, named people. Seeded content must be sourced from SPPG/SPLN
  materials. Spotlight stories about named graduates are created by directors, with consent.
- Non-partisan, always: no party logos, no campaign messaging, no endorsement language.
- Member articles are published **only** after admin approval (`pending` → `published` / `changes_requested` / `rejected`).

## 6. How to build a feature (the loop)

1. **Read** CLAUDE.md, BRAND.md and the top of CHANGELOG.md. Check the relevant existing component before creating a new one.
2. **Plan** the data first: schema change? new query in `lib/queries.ts`? new action?
3. **Build** server-first: page (Server Component) → query → action → minimal client island.
4. **Reuse** primitives in `components/ui` (Button, Card, Badge, Field, Section, FrameBar, Avatar…). If you copy-paste
   a block of markup a second time, extract it.
5. **Verify**: `npm run typecheck && npm run lint && npm run build`, then click through the feature in `npm run dev`
   at 375px and 1440px widths, signed-out, as a member, and as an admin.
6. **Record**: add an entry at the top of CHANGELOG.md (Added / Changed / Fixed / Security / Data) — every merge.
7. **Commit** small and descriptive (`feat(directory): filter by office status`). Never commit `.env*`, `.data/`, CSVs.

## 7. Conventions

- Server Components fetch via functions in `src/lib/queries.ts`; mutations live in `actions.ts` next to their route.
- Actions validate input with `zod`, return `{ ok: true } | { ok: false, error, fieldErrors? }`, and call `revalidatePath`.
- Pages read `searchParams`/`params` as Promises (Next 15).
- Names from the registry pass through `cleanName()`; slugs through `slugify()` (`src/lib/text.ts`).
- Dates displayed `en-GB` (`21 August 2025`), British spelling ("programme", "organise") to match SPPG.
- Images: `next/image` for local + Blob URLs; always meaningful `alt`.
- Accessibility: semantic landmarks, visible focus rings, colour contrast AA, every input labelled, motion respects `prefers-reduced-motion`.

## 8. Environments & deployment

- **Vercel → Storage → Neon (Marketplace)** creates `DATABASE_URL` automatically. **Vercel → Storage → Blob** creates `BLOB_READ_WRITE_TOKEN`.
- Set `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL` in Vercel env.
- First deploy: locally point `DATABASE_URL` at Neon, then `db:migrate` → `db:seed` → `db:import-graduates` → `admin:create`.
- Schema changes: generate locally, commit, then run `db:migrate` against Neon **before** the deploy that depends on it.

## 9. Open items / decisions log

Keep this list current; move resolved items to CHANGELOG.

- Kenya graduation year shown as 2026 (pioneer class); Senegal pioneer class 2025.
- Registry vs. quoted totals: registry has Nigeria 1,261 / Senegal 46 / Kenya 55 = 1,362 (quoted: 1,262 / 45 / 55). Site shows live registry counts.
- One registry row (James Chamberlain Omailey, Class of 2025) has no email → can't self-verify until a director adds one.
- French (FR) version for Senegal: planned — copy lives in `site.ts` to make i18n straightforward.
- Events are static in `site.ts` (typed `SplnEvent`, with agenda/speakers → `/events/[slug]`); move to DB with an admin screen when cadence justifies it.
- SPPG Minis one-line description: awaiting input from SPLN.
