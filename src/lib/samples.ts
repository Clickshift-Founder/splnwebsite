import "server-only";
import { eq, inArray, or } from "drizzle-orm";
import type { DB } from "@/db/connect";
import { cohorts, graduates, posts, spotlights } from "@/db/schema";

/**
 * Demo content so directors can present the platform before real stories exist.
 * Everything here is FICTIONAL, flagged `isSample`, labelled "Sample" on every public page,
 * excluded from graduate totals and the sitemap, and removed in one click from /admin.
 * Personas use names that do not appear on the graduate register; roles are generic and
 * no party, real constituency or real institution is named.
 */

const NOTE = "\n\n---\n\n*Sample content, shown to demonstrate the format. Directors can replace or remove it at any time.*";

const PERSONAS = [
  {
    key: "amara",
    fullName: "Amara Okonkwo-Bello",
    cohort: "ng-2022",
    headline: "Founder, CivicLedger · Civic technology",
    location: "Lagos, Nigeria",
    bio: "Builds tools that make public budgets readable for citizens. Before founding CivicLedger she spent eight years in public finance consulting.\n\nSPPG Class of 2022. Member, Research, Data & Political Intelligence Committee.",
    linkedinUrl: "https://www.linkedin.com/",
    officeStatus: "none" as const,
  },
  {
    key: "tunde",
    fullName: "Tunde Adebayo-Lawal",
    cohort: "ng-2023",
    headline: "Candidate, State House of Assembly",
    location: "Ibadan, Nigeria",
    bio: "Community organiser and youth-employment advocate. Running on a platform of open local budgets and skills hubs in every ward.\n\nSPPG Class of 2023.",
    xUrl: "https://x.com/",
    officeStatus: "candidate" as const,
    officeTitle: "State House of Assembly",
  },
  {
    key: "wanjiru",
    fullName: "Wanjiru Kamau-Otieno",
    cohort: "ke-2026",
    headline: "County Executive Committee Member for Health",
    location: "Nairobi, Kenya",
    bio: "Public-health specialist leading primary-care reform at county level. Previously ran community health programmes across three counties.\n\nSPPG Kenya, Pioneer Class of 2026.",
    linkedinUrl: "https://www.linkedin.com/",
    officeStatus: "appointed" as const,
    officeTitle: "County Executive Committee Member for Health",
  },
  {
    key: "fatou",
    fullName: "Fatou Ndiaye Sarr",
    cohort: "sn-2025",
    headline: "Municipal councillor · Participatory budgeting",
    location: "Dakar, Senegal",
    bio: "Champion of participatory budgeting and women's inclusion in local decision-making.\n\nSPPG Senegal, Pioneer Class of 2025.",
    facebookUrl: "https://www.facebook.com/",
    officeStatus: "elected" as const,
    officeTitle: "Municipal councillor",
  },
  {
    key: "halima",
    fullName: "Halima Garba Musa",
    cohort: "ng-2024",
    headline: "Policy analyst · Public finance",
    location: "Abuja, Nigeria",
    bio: "Writes on budget credibility, fiscal federalism and service delivery.\n\nSPPG Class of 2024.",
    linkedinUrl: "https://www.linkedin.com/",
    officeStatus: "none" as const,
  },
  {
    key: "chidinma",
    fullName: "Chidinma Eze-Lawson",
    cohort: "ng-2021",
    headline: "Special Adviser on Education",
    location: "Enugu, Nigeria",
    bio: "Former teacher turned education-policy practitioner, now advising on basic-education reform.\n\nSPPG Class of 2021.",
    xUrl: "https://x.com/",
    officeStatus: "appointed" as const,
    officeTitle: "Special Adviser on Education",
  },
];

type Key = (typeof PERSONAS)[number]["key"];

const SPOTLIGHTS: { persona: Key; category: string; title: string; summary: string; story: string; featured?: boolean; evidence: { url: string; label: string }[] }[] = [
  {
    persona: "amara",
    category: "Venture & Enterprise",
    featured: true,
    title: "Class of 2022 graduate launches a civic-tech platform that turns budgets into plain language",
    summary: "CivicLedger lets citizens see what their local government planned to spend — and what it actually spent — in a few taps.",
    story: `**Amara Okonkwo-Bello**, a graduate of SPPG's Class of 2022, has launched **CivicLedger**, a platform that translates public budget documents into plain-language summaries citizens can actually use.

## What happened

Over twelve months, Amara and a small team built tools that read published budget documents and present them by ward, by sector and by project. Citizens can compare what was planned with what was released, and flag projects they cannot find on the ground.

## Why it matters

Budgets are where promises become real. When citizens can follow the money, public officials have a stronger incentive to deliver — and reformers inside government gain allies outside it.

## The SPPG connection

> "SPPG taught me that the Office of the Citizen is the most important office in a democracy. CivicLedger is my attempt to equip that office."

Amara credits the programme's public-finance modules and her Capstone community project, which first tested the idea with a single local government.${NOTE}`,
    evidence: [{ url: "https://example.org/civicledger-launch", label: "Launch announcement (sample link)" }],
  },
  {
    persona: "tunde",
    category: "On the Ballot",
    title: "Class of 2023 graduate secures party ticket for a State House of Assembly seat",
    summary: "After two years of ward-level organising, Tunde Adebayo-Lawal won his party's primary on a platform of open local budgets.",
    story: `**Tunde Adebayo-Lawal** (SPPG Class of 2023) has won his party's primary and will contest a **State House of Assembly** seat in the next general election.

## The campaign

Tunde's campaign was built ward by ward: town halls in every community, a published campaign budget, and a manifesto drafted with residents rather than for them — an approach he first developed in his SPPG personal manifesto.

## What he's running on

- Open, published local budgets
- A skills hub in every ward
- Quarterly public reports to constituents

## Run to win. Govern good.

SPLN is non-partisan and does not endorse candidates. We celebrate every graduate who steps into the arena with character, competence and capacity.${NOTE}`,
    evidence: [{ url: "https://example.org/primary-results", label: "Primary results (sample link)" }],
  },
  {
    persona: "wanjiru",
    category: "Public Service",
    title: "Kenya pioneer-class graduate appointed to lead county health reform",
    summary: "Wanjiru Kamau-Otieno joins the County Executive Committee with a mandate to strengthen primary health care.",
    story: `**Wanjiru Kamau-Otieno**, a member of SPPG Kenya's **Pioneer Class of 2026**, has been appointed **County Executive Committee Member for Health**.

## What she walked into

A health system under pressure: stock-outs of essential medicines, long waits at referral hospitals, and community health workers without the tools they need.

## What she plans to do differently

Her first-100-days plan focuses on three things: publishing facility-level stock data every month, strengthening community health units, and a public scorecard for every county health facility.

## One lesson for the next public servant

> "Measure in public. If citizens can see the numbers, they become your partners in fixing them."

*Part of the **SPLN in Public Service** Spotlight Series.*${NOTE}`,
    evidence: [{ url: "https://example.org/county-gazette", label: "Appointment notice (sample link)" }],
  },
  {
    persona: "fatou",
    category: "Policy & Reform",
    title: "Senegal graduate brings participatory budgeting to her municipality",
    summary: "Fatou Ndiaye Sarr led the council's first participatory budgeting cycle, with women's groups setting a share of local priorities.",
    story: `**Fatou Ndiaye Sarr** (SPPG Senegal, Pioneer Class of 2025) has led her municipal council's first **participatory budgeting** cycle.

## How it worked

Residents met in neighbourhood assemblies to propose projects, then voted on a shortlist. Women's associations and youth groups were given dedicated sessions so their priorities were heard first, not last.

## What changed

For the first time, residents could see why projects were chosen — and track their delivery through quarterly public meetings.

## The SPPG value that mattered most

**Character** — "Reform starts with being willing to share power."${NOTE}`,
    evidence: [{ url: "https://example.org/budget-assemblies", label: "Council communiqué (sample link)" }],
  },
];

const POSTS: { persona: Key | null; type: "article" | "thought_leadership" | "news"; title: string; excerpt: string; topic: string; body: string; sources: string; featured?: boolean }[] = [
  {
    persona: "halima",
    type: "thought_leadership",
    featured: true,
    topic: "Public finance",
    title: "Africa's next reformers must master the budget, not just the ballot",
    excerpt: "Winning office is the beginning. The real test of a reformer is whether they can read, shape and defend a budget.",
    body: `Every election season produces bold promises. Far fewer produce leaders who can turn those promises into line items — and protect them through the year.

## The problem

Across many African countries, the gap between the **approved budget** and **what is actually spent** is where accountability quietly disappears. Capital projects are announced, partially funded, and forgotten. Citizens rarely see the difference.

## What the evidence says

Independent assessments of budget transparency, such as the **Open Budget Survey**, consistently find that most governments publish too little, too late, for citizens to follow the money. Where in-year and year-end reports *are* published, civil society and legislators can ask sharper questions.

## What reformers can do

1. **Learn the budget calendar** — and intervene before the numbers are fixed.
2. **Insist on publication** — of in-year implementation reports, not just the approved budget.
3. **Build coalitions** with civil society and the media, who can amplify what the numbers show.

## The takeaway

Public leaders who master the budget can deliver what they promise. Those who don't will keep making promises.`,
    sources: "Open Budget Survey — International Budget Partnership — https://internationalbudget.org/open-budget-survey\nPublic Expenditure and Financial Accountability (PEFA) framework — PEFA Secretariat — https://www.pefa.org",
  },
  {
    persona: "chidinma",
    type: "article",
    topic: "Public service",
    title: "What my first 100 days in government taught me about reform",
    excerpt: "A practice note from inside public office: the meetings that matter, the data you won't have, and the allies you need.",
    body: `When I took up my appointment, I had a plan. Within a week I learnt that a plan is only as good as the information and relationships behind it.

## Lesson 1: Start with the data you don't have

The first thing I asked for was a list of every school and its enrolment. It took six weeks to assemble. That delay became my first reform: a simple, shared school census, updated each term.

## Lesson 2: The civil service is your ally, not your obstacle

Career officers know where the bottlenecks are. Bringing them into planning — rather than announcing plans to them — changed the pace of everything.

## Lesson 3: Communicate before you need to

Parents and teachers heard about our reforms from us first, not from rumours. That trust bought us time when things went wrong.

## For the next public servant

Spend your first month listening and counting. The reforms will be better for it.`,
    sources: "Practice note based on the author's own experience in office (illustrative sample).",
  },
  {
    persona: null,
    type: "news",
    topic: "PeerBridge",
    title: "PeerBridge mentor registration is open for the next SPPG class",
    excerpt: "Graduates with five or more years of leadership experience can register to mentor a new SPPG student through the demanding first months.",
    body: `New SPPG students often need guidance, reassurance and a friendly voice who understands the journey. **PeerBridge** pairs every new student with a graduate who has already walked the path.

## Who we're looking for

Graduates with 5+ years of leadership experience — public servants, civic leaders, policy practitioners and reformers.

## The commitment

A structured six-month cycle: a virtual orientation, monthly one-on-one check-ins, at least one learning circle, and short reflections at the midpoint and the end.

[Register to become a PeerBridge mentor](/member/mentor) — graduates sign in with their registered email first.`,
    sources: "",
  },
];

export async function loadSamples(db: DB, adminId: number) {
  await removeSamples(db); // idempotent: reload cleanly

  const allCohorts = await db.select({ id: cohorts.id, slug: cohorts.slug }).from(cohorts);
  const ids = new Map<Key, number>();
  for (const p of PERSONAS) {
    const cohortId = allCohorts.find((c) => c.slug === p.cohort)?.id;
    if (!cohortId) continue; // class not configured on this install
    const { key, cohort, ...rest } = p;
    void cohort;
    const [g] = await db
      .insert(graduates)
      .values({ ...rest, cohortId, slug: `sample-${key}`, email: null, isSample: true })
      .returning({ id: graduates.id });
    ids.set(key, g.id);
  }

  const now = Date.now();
  for (const [i, s] of SPOTLIGHTS.entries()) {
    const graduateId = ids.get(s.persona);
    if (!graduateId) continue;
    await db.insert(spotlights).values({
      slug: `sample-${s.persona}-story`,
      graduateId,
      category: s.category,
      title: s.title,
      summary: s.summary,
      story: s.story,
      evidenceLinks: s.evidence,
      gallery: [],
      isPublished: true,
      featured: Boolean(s.featured),
      isSample: true,
      createdById: adminId,
      publishedAt: new Date(now - i * 86_400_000 * 3),
    });
  }

  for (const [i, p] of POSTS.entries()) {
    await db.insert(posts).values({
      slug: `sample-post-${i + 1}`,
      type: p.type,
      status: "published",
      title: p.title,
      excerpt: p.excerpt,
      topic: p.topic,
      body: p.body + (p.type === "news" ? "" : NOTE),
      sources: p.sources || null,
      featured: Boolean(p.featured),
      authorGraduateId: p.persona ? ids.get(p.persona) ?? null : null,
      authorName: p.persona ? null : "SPLN Secretariat",
      isSample: true,
      publishedAt: new Date(now - (i + 1) * 86_400_000 * 2),
    });
  }

  return { graduates: ids.size, spotlights: SPOTLIGHTS.length, posts: POSTS.length };
}

export async function removeSamples(db: DB) {
  const sampleGrads = await db.select({ id: graduates.id }).from(graduates).where(eq(graduates.isSample, true));
  const gIds = sampleGrads.map((g) => g.id);
  await db.delete(spotlights).where(gIds.length ? or(eq(spotlights.isSample, true), inArray(spotlights.graduateId, gIds)) : eq(spotlights.isSample, true));
  await db.delete(posts).where(gIds.length ? or(eq(posts.isSample, true), inArray(posts.authorGraduateId, gIds)) : eq(posts.isSample, true));
  if (gIds.length) await db.delete(graduates).where(inArray(graduates.id, gIds));
}

export async function sampleCounts(db: DB) {
  const [g, s, p] = await Promise.all([
    db.$count(graduates, eq(graduates.isSample, true)),
    db.$count(spotlights, eq(spotlights.isSample, true)),
    db.$count(posts, eq(posts.isSample, true)),
  ]);
  return { graduates: g, spotlights: s, posts: p, total: g + s + p };
}
