/**
 * All public prose for the SPLN site. Components render this; they don't author it.
 * Sources: SPLN Website Content Package v2 (concept note, ToR, handbook, charter, PeerBridge,
 * Spotlight Series), thesppg.org (About, Program, Impact). Keep facts traceable to those.
 */

export const SITE = {
  name: "SPPG Public Leaders Network",
  short: "SPLN",
  parent: "School of Politics, Policy & Governance",
  parentUrl: "https://thesppg.org",
  applyUrl: "https://thesppg.org/admissions",
  contactEmail: "pln@nigeria.thesppg.org",
  tagline: "A community of public leaders. Africa's future in action.",
  launchVideo: "https://drive.google.com/file/d/1czusc9HbXYkJfLP3vZi4PDXl_89sr5z7/view",
  // Official SPPG/SPLN social URLs — fill these in (left empty until verified; empty = icon hidden).
  socials: { x: "", linkedin: "", facebook: "" },
};

export const NAV = [
  { href: "/about", label: "About" },
  { href: "/graduates", label: "Graduates" },
  { href: "/spotlight", label: "Spotlight" },
  { href: "/insights", label: "Insights" },
  { href: "/network", label: "The Network" },
  { href: "/impact", label: "Impact" },
];

export const HERO = {
  eyebrow: "SPPG Public Leaders Network",
  headline: ["Welcome home.", "The network is", "already moving."],
  sub: "SPLN is the lifelong community Africa's public leaders graduate into — not out of. Over a thousand graduates of the School of Politics, Policy & Governance, across four nations, working together to transform how the continent is governed.",
};

/** The only door into SPLN. Step 5 is what makes membership mean something. */
export const PATH = [
  {
    n: "01",
    title: "Apply",
    body: "Apply to the next SPPG class in your country — Nigeria, Kenya, Senegal or Ghana. Applications are open to future office-holders, public servants, advisers, professionals and engaged citizens.",
  },
  {
    n: "02",
    title: "Get admitted",
    body: "Admission is rigorous. Only a small fraction of applicants are offered a seat — selected for demonstrated commitment to public leadership and the promise of character, competence and capacity.",
  },
  {
    n: "03",
    title: "Complete 10 months",
    body: "Ten intensive months, November to August: 26 core modules, 7 thematic areas, 140+ topics, 15 live hours a week, group peer-to-peer assessment, a personal manifesto and a community Capstone.",
  },
  {
    n: "04",
    title: "Graduate",
    body: "Graduation requires every module, the Capstone, every peer evaluation and a 98% attendance-and-participation standard. Then you walk the stage — in Abuja, Dakar or Nairobi.",
  },
  {
    n: "05",
    title: "Earn the 3Cs attestation",
    body: "SPPG's Senior Leadership Team attests that each graduate's 3Cs Index — Character, Competence and Capacity — stands above the threshold. No attestation, no induction.",
  },
  {
    n: "06",
    title: "Join SPLN for life",
    body: "You are introduced to the network: a country group, a class group, a working committee, PeerBridge mentorship, and a community that doesn't let go after the ceremony ends.",
  },
];

export const THREE_CS = [
  { key: "Character", body: "Ethical formation and leadership credibility. Integrity that holds when no one is watching.", color: "green" },
  { key: "Competence", body: "Understanding governance at every level and in every context — policy, institutions, politics.", color: "blue" },
  { key: "Capacity", body: "The practical ability to execute, communicate, analyse and lead — to run to win and govern good.", color: "amber" },
] as const;

export const NOT_ALUMNI = {
  title: "Not a traditional alumni association.",
  body: "SPLN isn't a directory of names and email addresses, and it isn't the old-style graduate association either — that model was tried, and it didn't hold. What replaced it is a co-managed, co-created network: built jointly by SPPG and its graduates, so the school's unconventional philosophy survives the moment a cohort leaves the classroom.",
};

export const VISION =
  "To become the most trusted and catalytic network of African public leaders shaping governance across generations — grounded in local realities, guided by global insight, and united by a shared resolve to lead with integrity, innovation, and impact.";

export const MISSION =
  "To cultivate and connect a distinguished community of African public leaders who translate bold ideas into public good through trusted collaboration, courageous action, and a commitment to systemic change.";

export const PILLARS = [
  {
    title: "Lifelong Learning & Leadership Development",
    body: "Training, workshops and learning labs; current tools, case studies and thought leadership; preparatory pathways into public service and political leadership.",
    icon: "GraduationCap",
  },
  {
    title: "Collective Action & Knowledge Exchange",
    body: "Joint projects across cohorts, professions and countries; communities of practice on key policy issues; a shared narrative and common impact agenda.",
    icon: "Network",
  },
  {
    title: "Mentorship & Career Advancement",
    body: "PeerBridge mentorship, political leadership coaching, policy fellowship tracks, career visibility and a deliberate pipeline into public office and the civil service.",
    icon: "Compass",
  },
  {
    title: "Institutional Continuity Rooted in Values",
    body: "Institutional memory anchored in democratic values; values-based accountability; graduates mobilised as reformers and changemakers in civic life.",
    icon: "Landmark",
  },
] as const;

export const STORY = {
  origin:
    "SPPG's founding question was never just \"how do we train leaders for the system that exists?\" It was \"how do we build leaders who can transform it?\" That thread runs from the Robert Bosch Academy — where, in 2019, Dr Obiageli \"Oby\" Ezekwesili convened thinkers in Berlin to ask how Africa could build a new political order — to today's graduates across four countries.",
  problem:
    "Graduation always raised the same problem: once a cohort leaves, does the connection to SPPG's mission survive? Every class asked the same question on its way out the door — what happens next?",
  answer:
    "SPPG first tried the conventional route: a graduate association run the way most schools run alumni relations. It didn't fit. So SPPG went back to first principles and reimagined graduate engagement as something co-managed and co-created with graduates, not managed for them. That is SPLN.",
  howItRuns:
    "Every SPPG graduate who earns the 3Cs attestation transitions into lifelong membership. A Director of the Network leads day-to-day operations, reporting into SPPG's Thought Leadership Department, supported by a Secretariat that works closely with three elected Class Representatives from every cohort.",
};

export const TIMELINE = [
  { year: "2019", text: "A convening of thinkers at the Robert Bosch Academy in Berlin plants the intellectual seed for SPPG." },
  { year: "2021", text: "SPPG is founded by Dr Oby Ezekwesili. The first Nigerian cohort graduates." },
  { year: "2021–24", text: "Four Nigerian cohorts graduate. The conventional graduate-association model is tried and found wanting." },
  { year: "2023", text: "55+ SPPG graduates contest office in Nigeria's general elections." },
  { year: "2025", text: "Senegal's pioneer class graduates in partnership with UCAD, Dakar. SPLN's structural build-out begins in April." },
  { year: "Aug 2025", text: "The Global SPLN launch, keynoted by Professor Jeffrey David Sachs. PeerBridge mentorship launches." },
  { year: "2026", text: "Kenya's pioneer class graduates and joins the network. Nigeria's sixth class graduates. Ghana admissions begin." },
];

export const STRUCTURE = [
  { level: "Global", title: "SPPG Public Leaders Network", body: "The pan-African community — continent-wide updates, convenings and announcements." },
  { level: "Country", title: "Country groups", body: "Nigeria · Senegal · Kenya · Ghana — local meetups, civic engagement and country-specific opportunities." },
  { level: "Class", title: "Year-based class groups", body: "Every cohort keeps its own space — Class of 2021, 2022, 2023 and onward — with three elected Class Representatives." },
  { level: "Region", title: "Regional groups", body: "Organised by where members live and engage — explicitly never along ethnic lines." },
  { level: "Office", title: "Graduates in Public Office", body: "An invitation-based tier connecting every graduate serving in appointed or elected office." },
];

export const LEADERSHIP = [
  { role: "Director of the Network", body: "Leads day-to-day operations and reports to SPPG's Thought Leadership Department." },
  { role: "Class Representatives", body: "Three elected per cohort, working directly with the Director's team." },
  { role: "The Secretariat", body: "The operational and administrative backbone of the network." },
];

export const COMMITTEES = [
  { name: "Innovating African Politics & Governance", body: "Rethinking governance models, institutional practice and reform pathways for Africa." },
  { name: "Political Leadership Development & Mentorship", body: "Capacity and mentorship pipelines for graduates aspiring to public office or leadership." },
  { name: "Advocacy, Civic Engagement & Public Voice", body: "Civic participation, citizen engagement and the public narrative on democracy and governance." },
  { name: "Research, Data & Political Intelligence", body: "Evidence, insight and political intelligence to guide decision-making and advocacy." },
  { name: "Communications, Media & Narrative Strategy", body: "The network's voice — storytelling, brand and public visibility." },
];

export const COMMITTEE_RULES = [
  "Open to every graduate — one committee per member, so effort stays focused.",
  "Each has a Lead, a Secretary and at least three active contributors, mixed across cohorts, countries and genders.",
  "Committees meet monthly, publish an annual workplan and report quarterly to the community.",
  "Deliverables range from research briefs and policy proposals to mentorship programmes, campaigns and events.",
];

export const SECTORS = [
  "Policy Think-Tank",
  "Politics & Governance",
  "IT & Innovation",
  "Business & Entrepreneurship",
  "Communication & Engagement",
  "Advocacy & Third Sector",
  "SPPG Minis",
];

export const PEERBRIDGE = {
  why: "SPPG's curriculum is intensive by design. New students have historically struggled with the pace, the workload and unfamiliar digital platforms. PeerBridge pairs every new student with a graduate who has already walked the path — from day one.",
  outcomes: [
    "Reduces dropout and improves completion",
    "Personal, human guidance through the SPPG experience",
    "Solidarity across cohorts",
    "SPPG's values embedded from day one",
    "Time management, resilience and digital fluency",
  ],
  phases: [
    "Recruit & onboard mentors (3–4 weeks pre-orientation)",
    "Match mentors and mentees in Orientation Week",
    "Monthly one-on-one check-ins (months 1–4)",
    "Bi-monthly peer learning circles",
    "Midpoint survey (month 2)",
    "Final review (month 5)",
  ],
  mentorAsk:
    "Graduates with 5+ years of leadership experience — public servants, civic leaders, policy practitioners and reformers. Mentors commit to a structured 6-month cycle: a virtual orientation, monthly check-ins, at least one learning circle, and short midpoint and final reflections.",
};

export const VALUES = [
  { title: "Accountability", body: "We answer to the people we serve — and to each other." },
  { title: "Respect & Tolerance", body: "Across parties, faiths, languages and borders." },
  { title: "Stewardship & Responsibility", body: "Public resources and public trust are held, not owned." },
  { title: "Social Justice & Inclusiveness", body: "Leadership that widens the circle of opportunity." },
  { title: "Ethical Leadership", body: "Integrity, honesty and respect for the rule of law." },
];

export const PLEDGE = {
  intro:
    "We, the graduates of the School of Politics, Policy and Governance, standing together as public leaders across Africa, solemnly pledge:",
  lines: [
    "To uphold the highest standards of character, competence, and capacity in public life.",
    "To lead with integrity, courage, and compassion, putting people above self-interest.",
    "To defend justice, equity, and accountability, wherever we serve.",
    "To work across borders and generations, building bridges of collaboration and solidarity.",
    "To commit ourselves to the transformation of Africa into a continent of prosperity, dignity, and good governance.",
  ],
  close: ["For our people.", "For our nations.", "For Africa.", "For generations to come."],
};

/** `date` is only a sort key / past-vs-upcoming marker; `when` is what we display (don't invent exact dates). */
export const EVENTS = [
  {
    date: "2025-08-21",
    when: "21 Aug 2025",
    title: "Global SPLN Launch",
    kind: "Flagship",
    place: "Virtual · Global",
    body: "“Empowering Public Leaders: Unlocking Potential Within the SPPG Network” — keynote by Professor Jeffrey David Sachs.",
    link: "https://drive.google.com/file/d/1czusc9HbXYkJfLP3vZi4PDXl_89sr5z7/view",
    linkLabel: "Watch the recording",
  },
  {
    date: "2025-10-01",
    when: "2025",
    title: "Abuja Leadership Workshop",
    kind: "Workshop",
    place: "Abuja, Nigeria",
    body: "Emerging African leaders from government, civil society and public service on geopolitics, power shifts, diplomacy, conflict resolution and regional cooperation.",
  },
  {
    date: "2026-03-21",
    when: "21 Mar 2026",
    title: "Leadership, Politics & Governance: A Practical Conversation",
    kind: "Conversation",
    place: "Hybrid · Live + YouTube",
    body: "A practitioner conversation on what it really takes to lead, run and govern.",
  },
  {
    date: "2026-07-31",
    when: "Jul 2026",
    title: "Kenya Graduation & Induction",
    kind: "Induction",
    place: "Nairobi, Kenya",
    body: "Kenya's pioneer class graduates and is formally inducted into SPLN.",
  },
  {
    date: "2026-12-31",
    when: "Q4 2026",
    title: "Bi-annual SPLN General Meeting",
    kind: "General Meeting",
    place: "Location by member density",
    body: "The network's physical, cross-country gathering — reports from committees, country groups and the Secretariat.",
  },
];

export const GET_INVOLVED = {
  prospective: [
    "Apply to the next SPPG class in your country",
    "Talk to a graduate about the programme",
    "Follow the Spotlight to see where SPPG leads",
  ],
  members: [
    "Claim and complete your directory profile",
    "Write for SPLN Insights",
    "Join one working committee and any working sector",
    "Become a PeerBridge mentor",
    "Nominate a peer for the Spotlight",
  ],
  partners: [
    "Co-host a Leadership Clinic",
    "Support PeerBridge mentorship",
    "Commission research from the Research & Data committee",
    "Bring SPLN graduates into your convenings",
  ],
};

/** SPPG's standard for anything published under the SPLN name. Shown on /write and enforced at review. */
export const WRITING_STANDARDS = [
  {
    title: "Evidence before opinion",
    body: "Every factual claim — a statistic, a quote, a budget figure, an outcome — is backed by a source a reader can check. Opinion is welcome; it must be labelled as opinion and argued from evidence.",
  },
  {
    title: "Verified, current data",
    body: "Use primary sources where possible (official gazettes, statistics bureaux, budget documents, court records, peer-reviewed research, reputable multilaterals). State the date and source of every figure. No unverified social-media claims.",
  },
  {
    title: "Cite everything",
    body: "List your sources at the end — title, publisher, date and link. Inline links are encouraged. Images need credit and permission.",
  },
  {
    title: "Non-partisan, always",
    body: "SPLN respects every member's party affiliation and takes no side. Analyse policies and institutions, not parties. No campaign messaging, endorsements or attacks on individuals.",
  },
  {
    title: "Original and honest",
    body: "Your own work, not previously published elsewhere without disclosure. Disclose any conflict of interest — including your own role in what you're writing about. AI-assisted drafting must be disclosed and every fact still verified by you.",
  },
  {
    title: "Solutions-minded and respectful",
    body: "Write to move Africa's governance forward: name the problem, show the evidence, propose what could work. Critique ideas with rigour and people with respect.",
  },
];

export const DECLARATIONS = [
  "Every factual claim in this piece is supported by a source I have listed.",
  "I have checked that the data I cite is accurate and current, and I have stated where it comes from.",
  "This piece is non-partisan: it does not campaign for or against any party or candidate.",
  "This is my original work, and I have disclosed any conflict of interest or AI assistance.",
  "I understand the SPLN editorial team may edit for clarity, request changes or decline publication.",
];

export const SPOTLIGHT_CATEGORIES = [
  "Public Service",
  "Elected / Appointed",
  "On the Ballot",
  "Venture & Enterprise",
  "Policy & Reform",
  "Community Impact",
  "Awards & Recognition",
  "Publications & Research",
] as const;

export const SPOTLIGHT_SERIES = {
  title: "SPLN in Public Service",
  body: "As graduates take on roles across federal, state and institutional levels, the Spotlight Series documents how SPPG-trained leaders translate values into action: what they met when they walked in, what they did differently, what changed — and one lesson for the next public servant coming up behind them.",
  safeguards: [
    "Strictly non-partisan — no campaign messaging, ever",
    "Focused on governance, service and institutional learning",
    "Every feature approved by the graduate before publication",
    "Participation is entirely voluntary",
  ],
};

export const QUOTES = [
  { text: "You are not joining an organisation that is waiting to be built. You are joining a community that is already moving.", by: "SPLN" },
  { text: "Nothing about Africa changes without a transformation of its politics.", by: "#FixPolitics" },
  { text: "Don't do politics alone. Don't run for office alone. Don't do advocacy or public service alone.", by: "SPPG" },
];
