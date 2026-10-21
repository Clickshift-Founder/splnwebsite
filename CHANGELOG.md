# Changelog

Every change to the SPLN platform, newest first. Add an entry for **every** merge (see CLAUDE.md §6).
Sections: **Added · Changed · Fixed · Security · Data · Notes**. Dates are absolute (YYYY-MM-DD).

---

## [0.1.0] — 2026-10-21 · Initial platform

The first complete build of the SPPG Public Leaders Network website and member platform.

### Added — public site
- **Home**: hero with a live dot-matrix map of Africa (SPPG countries lit in frame colours, pulsing pins, network arcs);
  live stat strip; "Not a traditional alumni association"; public-office numbers; **the six-step path to membership**
  (Apply → Admitted → 10 months → Graduate → SLT 3Cs attestation → SPLN for life); Spotlight preview; directory search;
  latest Insights; country cards; closing call to apply.
- **Graduate Directory** (`/graduates`): verified register of all graduates — search by name/role/location; filter by
  country, class and public-life status (aspirant / candidate / appointed / elected); pagination; completed profiles first.
- **Graduate profiles** (`/graduates/[slug]`): photo, role, location, bio, LinkedIn/X/Facebook, verified-graduate panel,
  Spotlight stories and published writing about/by them, classmates. "Is this you? Edit this profile" CTA.
- **Claim / sign in** (`/claim`): graduates verify with the email SPPG holds (primary or alternate) and a 6-digit
  one-time code — no passwords.
- **Member area** (`/member`): dashboard with profile-strength checklist and submission statuses + editor notes;
  profile editor with photo upload; article editor (Markdown, live preview, word count, sources, editorial declarations).
- **Spotlight** (`/spotlight`, `/spotlight/[slug]`): stories of what graduates are doing — category filters, featured
  layout, story pages with evidence gallery and source links; "SPLN in Public Service" series explainer; peer/self
  **nomination form**.
- **Insights** (`/insights`, `/insights/[slug]`): news, articles, thought leadership with verified bylines, reading time,
  numbered sources; featured layout; type filters.
- **Write for SPLN** (`/write`): the SPPG editorial standard (6 rules), process, formats, what counts as evidence,
  the 5 declarations.
- **About, How to join, The Network, Impact, Events** pages built from the SPLN content package + thesppg.org.
- Admissions bar (site-wide), mobile menu, SVG national flags (Windows has no flag emoji), 404, sitemap, robots, OG metadata.

### Added — directors' console (`/admin`)
- Email + password sign-in (bcrypt), roles: **super admin** and **editor**; add/reset/deactivate admins; change password.
- **Dashboard**: review queue, new nominations, directory health, recent activity (audit log).
- **Insights & review**: status tabs; review screen with preview, sources, author's declarations, reviewer checklist;
  **Approve & publish / Request changes / Decline** (note required for the last two); staff posts; unpublish; delete.
- **Spotlight**: create/edit stories — **search-and-select the graduate from the register**, upload their photo (optionally
  set as their profile photo), cover image, Markdown story, **evidence gallery with captions**, evidence links,
  publish/feature toggles.
- **Graduates**: search (name, email, matric no.), filters (class, hidden, claimed, in public life, no email),
  **one-click hide/unhide**, full edit (register + public-life status + public profile), add graduate,
  **CSV import/update**.
- **Numbers**: edit public-office figures (value, label, detail); add/remove figures; graduate totals computed live.
- **Countries & classes** (super admin): add a country or class, set admissions open, partner, apply link —
  the map, filters, admissions bar and impact pages update automatically.
- **Nominations** inbox with status workflow.

### Data
- Schema: countries, cohorts, graduates (private register fields + public profile + office status + hidden flag),
  verification_codes, admins, stats, posts, spotlights, nominations, audit_log (`drizzle/0000_init.sql`).
- Seed: 4 countries (NG, SN, KE active · GH launching), 8 classes, public-office stats (98 aspirants, 22 candidates,
  33 appointed — NG 30 · SN 3, 1 elected — KE), 3 factual launch posts.
- Registry import: **1,362 graduates** — Nigeria 1,261 (6 classes), Senegal 46, Kenya 55. Registry differs slightly from
  quoted figures (1,262 / 45) — the site shows live registry counts.
- One graduate has two emails ("a or b") → both accepted for verification. One has no email (James Chamberlain
  Omailey, Class of 2025) → listed, flagged "no email on file" in admin.
- Name clean-up on import: shouted words title-cased ("ALIYU Adamu" → "Aliyu Adamu"); "(PhD)", roman numerals, McNames kept.

### Security
- Private register fields (email, phone, matric no., state) never selected into public queries; verified by scanning
  rendered pages.
- Middleware + per-action `requireAdmin()` / `requireMember()`; graduates can only edit their own profile and
  unpublished posts.
- One-time codes: hashed, 15-min expiry, 5 attempts, 3 sends / 15 min; constant-time compare.
- Uploads: images only, ≤ 5 MB, admin/member only (graduates limited to profile + post images); client-side resize.
- Markdown rendered without raw HTML; external links `nofollow noopener`.
- Admin/member pages `noindex` + `no-store`; registry CSV gitignored.

### Fixed (during build)
- React 19 resets uncontrolled forms after a server action — would have wiped an article on a validation error.
  All forms now submit via `useFormAction` (no reset) and keep input on error.
- Embedded PGlite crashed (WASM `Aborted()`) under Next dev's concurrent load → local DB now runs as its own process
  (`npm run db:dev`) behind a Postgres socket; app uses `postgres.js` locally and the Neon HTTP driver in production.
- Scroll-reveal content was invisible until JS ran → now progressive (visible in server HTML, animates only below the fold).

### Verified
- `tsc`, ESLint and `next build` clean.
- End-to-end walkthrough (headless Chrome): claim with wrong email/code → verify → edit profile + photo → submit article
  (validation keeps text) → admin login (wrong password rejected) → request-changes requires note → approve → live on
  Insights → create Spotlight via graduate search → live page with evidence → edit stats (reflected on /impact) →
  hide graduate (404 + absent from search) → unhide → anonymous upload 401, member/admin routes redirect.

### Notes / next up
- Every public page renders on demand because the header reads the member cookie; move the member badge client-side
  to make marketing pages static/ISR when traffic grows.
- Admin login throttle is in-memory (per serverless instance); add a DB/Upstash-backed limiter if abuse appears.
- French (FR) version for Senegal; events managed from admin; committee lead names; SPPG Minis description;
  mentor application link; official social URLs (`SITE.socials`).
