// Baseline data: countries, cohorts, headline stats, first admin, launch posts.
// Runs on EVERY Vercel deploy (scripts/predeploy.ts), so it only ever INSERTS what is missing —
// it never overwrites anything directors have edited in the console.
import "./_env";
import { createDb } from "../src/db/connect";
import { countries, cohorts, stats, posts, galleryPhotos } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { admins } from "../src/db/schema";
import { normaliseEmail } from "../src/lib/text";
import type { DB } from "../src/db/connect";

export const COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", status: "active", admissionsOpen: true, sortOrder: 1,
    admissionsEmail: "admission@nigeria.thesppg.org", applyUrl: "https://thesppg.org/admissions",
    blurb: "Where it all began. Six graduating classes since 2021, with graduates contesting elections and serving in public office nationwide." },
  { code: "SN", name: "Senegal", flag: "🇸🇳", status: "active", admissionsOpen: true, sortOrder: 2,
    admissionsEmail: "admission@senegal.thesppg.org", applyUrl: "https://thesppg.org/admissions",
    partner: "Université Cheikh Anta Diop (UCAD), Dakar",
    blurb: "SPPG's first Francophone chapter, extending the model across West Africa. Pioneer class graduated in 2025." },
  { code: "KE", name: "Kenya", flag: "🇰🇪", status: "active", admissionsOpen: true, sortOrder: 3,
    admissionsEmail: "admission@kenya.thesppg.org", applyUrl: "https://thesppg.org/admissions",
    blurb: "SPPG's East African expansion. The pioneer class graduated in 2026 — and the next admissions cycle is already under way." },
  { code: "GH", name: "Ghana", flag: "🇬🇭", status: "launching", admissionsOpen: true, sortOrder: 4,
    applyUrl: "https://thesppg.org/admissions",
    blurb: "The fourth country in the rollout. Admissions for Ghana's pioneer class are in progress." },
] as const;

/** sourceLabel = the exact "Class" value used in the graduate registry CSV. */
export const COHORTS = [
  { slug: "ng-2021", countryCode: "NG", name: "Class of 2021", year: 2021, sourceLabel: "Class of 2021", sortOrder: 1 },
  { slug: "ng-2022", countryCode: "NG", name: "Class of 2022", year: 2022, sourceLabel: "Class of 2022", sortOrder: 2 },
  { slug: "ng-2023", countryCode: "NG", name: "Class of 2023", year: 2023, sourceLabel: "Class of 2023", sortOrder: 3 },
  { slug: "ng-2024", countryCode: "NG", name: "Class of 2024", year: 2024, sourceLabel: "Class of 2024", sortOrder: 4 },
  { slug: "ng-2025", countryCode: "NG", name: "Class of 2025", year: 2025, sourceLabel: "Class of 2025", sortOrder: 5 },
  { slug: "ng-2026", countryCode: "NG", name: "Class of 2026", year: 2026, sourceLabel: "Class of 2026", sortOrder: 6 },
  { slug: "sn-2025", countryCode: "SN", name: "Pioneer Class of 2025", year: 2025, sourceLabel: "Senegal", sortOrder: 7 },
  { slug: "ke-2026", countryCode: "KE", name: "Pioneer Class of 2026", year: 2026, sourceLabel: "Kenya Pioneer Class", sortOrder: 8 },
];

const STATS = [
  { key: "aspirants", label: "Aspirants", value: 98, group: "public_office", sortOrder: 1, detail: "Declared for office, 2023–2027 cycle" },
  { key: "candidates", label: "Candidates", value: 22, group: "public_office", sortOrder: 2, detail: "On the ballot, 2023–2027 cycle" },
  { key: "appointed", label: "Appointed to office", value: 33, group: "public_office", sortOrder: 3, detail: "Nigeria 30 · Senegal 3" },
  { key: "elected", label: "Elected to office", value: 1, group: "public_office", sortOrder: 4, detail: "Kenya" },
  { key: "committees", label: "Graduate-led committees", value: 5, group: "network", sortOrder: 1, detail: null },
  { key: "countries_goal", label: "Countries on the roadmap", value: 20, group: "network", sortOrder: 2, detail: null },
];

const LAUNCH_POSTS = [
  {
    slug: "spln-goes-global-jeffrey-sachs-keynote",
    type: "news" as const,
    title: "SPLN goes global: Professor Jeffrey Sachs keynotes the network's launch",
    excerpt: "On 21 August 2025, graduates from across SPPG's countries gathered for the Global SPLN Launch — \"Empowering Public Leaders: Unlocking Potential Within the SPPG Network.\"",
    topic: "Network",
    publishedAt: new Date("2025-08-21T12:00:00Z"),
    body: `On **21 August 2025**, the SPPG Public Leaders Network formally launched as a global, pan-African community of public leaders.

The theme — *Empowering Public Leaders: Unlocking Potential Within the SPPG Network* — captured what SPLN was designed to be: not a traditional alumni association, but a co-managed, co-created network that keeps SPPG's philosophy of **character, competence and capacity** alive long after graduation.

The keynote was delivered by **Professor Jeffrey David Sachs**.

## Why it matters

Between 2021 and 2024, SPPG graduated four Nigerian cohorts while new classes were forming in Senegal and beyond. Every class asked the same question on the way out: *what happens next?* The launch was the network's answer — a lifelong home with country groups, class groups, working committees, PeerBridge mentorship and a dedicated community for graduates in public office.

[Watch the launch recording](https://drive.google.com/file/d/1czusc9HbXYkJfLP3vZi4PDXl_89sr5z7/view)`,
  },
  {
    slug: "kenya-pioneer-class-joins-spln",
    type: "news" as const,
    title: "Kenya's pioneer class joins the network",
    excerpt: "55 graduates of SPPG Kenya's pioneer class have been inducted into SPLN — taking the network's footprint to East Africa.",
    topic: "Expansion",
    publishedAt: new Date("2026-07-31T12:00:00Z"),
    body: `SPPG Kenya's **pioneer class of 55 graduates** completed the ten-month Certificate in Public Leadership & Policy in July 2026 and has been inducted into the SPPG Public Leaders Network.

Kenya is SPPG's East African expansion and the third country to produce graduates, after Nigeria (since 2021) and Senegal (2025). Admissions for the next Kenyan class are already under way, and Ghana's pioneer admissions are in progress.

Welcome home, Kenya. 🇰🇪`,
  },
  {
    slug: "welcome-to-the-new-spln-platform",
    type: "news" as const,
    title: "Welcome to the new home of the SPPG Public Leaders Network",
    excerpt: "A verified graduate directory, a Spotlight on what our graduates are building, and a publishing platform for evidence-based thought leadership.",
    topic: "Network",
    publishedAt: new Date(),
    body: `This platform is built for the **1,300+ graduates** of the School of Politics, Policy & Governance — and for everyone who wants to know who they are and what they are doing.

## What's here

- **The Graduate Directory** — anyone can confirm that a person is a verified SPPG graduate, by country and cohort.
- **Your profile, your voice** — every graduate can claim their profile with the email SPPG holds on record, then add a photo, a short bio and social links.
- **Spotlight** — stories of graduates launching ventures, winning primaries, taking up appointments and driving reform.
- **Insights** — articles and thought leadership written by graduates and reviewed by the SPLN editorial team against SPPG's standards of evidence.

Find yourself in the directory, claim your profile, and tell us what you're building.`,
  },
];

/** Real SPPG photos (from thesppg.org), attributed from what the photos show. */
const GALLERY = [
  { url: "/images/grad-stage.jpg", width: 1500, height: 999, countryCode: "NG", cohort: "ng-2024", occasion: "Graduation", caption: "The Class of 2024 with SPPG leadership at the Shehu Musa Yar'Adua Centre, Abuja", featured: true },
  { url: "/images/grad-audience.jpg", width: 1600, height: 1067, countryCode: "NG", cohort: "ng-2024", occasion: "Graduation", caption: "Graduands of the Class of 2024 at the ceremony", featured: false },
  { url: "/images/grad-cert.jpg", width: 1400, height: 933, countryCode: "NG", cohort: null, occasion: "Graduation", caption: "A graduate receives their certificate at a hybrid ceremony", featured: false },
  { url: "/images/afcon-group.jpg", width: 1800, height: 809, countryCode: "NG", cohort: null, occasion: "Africa Conference", caption: "SPPG leadership and partners at the Africa Conference", featured: false },
  { url: "/images/sn-class-photo.jpg", width: 1080, height: 732, countryCode: "SN", cohort: "sn-2025", occasion: "Graduation", caption: "SPPG Senegal's pioneer class at the Remise de Diplômes, Dakar", featured: true },
  { url: "/images/sn-class-wide.jpg", width: 1080, height: 551, countryCode: "SN", cohort: "sn-2025", occasion: "Graduation", caption: "Senegal's pioneer graduates with faculty and guests", featured: false },
  { url: "/images/sn-certificate.jpg", width: 1115, height: 892, countryCode: "SN", cohort: "sn-2025", occasion: "Graduation", caption: "Certificate presentation, Dakar", featured: false },
  { url: "/images/ke-flags-crowd.jpg", width: 1600, height: 1067, countryCode: "KE", cohort: "ke-2026", occasion: "Graduation", caption: "Kenya's pioneer class celebrates at graduation", featured: true },
  { url: "/images/ke-embrace.jpg", width: 1600, height: 1067, countryCode: "KE", cohort: "ke-2026", occasion: "Graduation", caption: "A Kenyan graduate is congratulated on stage", featured: false },
];

export async function seedBaseline(db: DB) {

  for (const c of COUNTRIES) {
    await db.insert(countries).values({ ...c }).onConflictDoNothing({ target: countries.code });
  }
  for (const c of COHORTS) {
    await db.insert(cohorts).values(c).onConflictDoNothing({ target: cohorts.slug });
  }
  for (const s of STATS) {
    await db.insert(stats).values(s).onConflictDoNothing({ target: stats.key });
  }
  // Launch posts only into an empty Insights table — a post a director deleted must stay deleted.
  if ((await db.$count(posts)) === 0) {
    for (const p of LAUNCH_POSTS) {
      await db.insert(posts).values({ ...p, status: "published", authorName: "SPLN Secretariat", featured: p.slug.startsWith("spln-goes") });
    }
  }

  if ((await db.$count(galleryPhotos)) === 0) {
    const all = await db.select({ id: cohorts.id, slug: cohorts.slug }).from(cohorts);
    for (const [i, g] of GALLERY.entries()) {
      const { cohort, ...rest } = g;
      await db.insert(galleryPhotos).values({ ...rest, cohortId: all.find((c) => c.slug === cohort)?.id ?? null, sortOrder: i });
    }
  }

  // First director from env — created once. Later password changes happen in the console and are never reset here.
  const email = process.env.ADMIN_EMAIL && normaliseEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
    const created = await db
      .insert(admins)
      .values({ name: process.env.ADMIN_NAME ?? "SPLN Director", email, passwordHash: await bcrypt.hash(password, 12), role: "super_admin" })
      .onConflictDoNothing({ target: admins.email })
      .returning({ id: admins.id });
    if (created.length) console.log(`✓ Admin created: ${email}`);
  } else if ((await db.$count(admins)) === 0) {
    console.warn("! No admin exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set — set them and redeploy, or run `npm run admin:create`.");
  }

  console.log(`✓ Baseline ready: ${await db.$count(countries)} countries, ${await db.$count(cohorts)} classes, ${await db.$count(stats)} figures, ${await db.$count(posts)} posts`);
}

async function main() {
  await seedBaseline(createDb());
  process.exit(0);
}

if (process.argv[1]?.includes("seed")) main().catch((e) => { console.error(e); process.exit(1); });
