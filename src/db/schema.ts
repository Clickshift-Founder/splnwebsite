import {
  pgTable, text, integer, boolean, timestamp, jsonb, pgEnum, uniqueIndex, index, serial,
} from "drizzle-orm/pg-core";

/* ──────────────────────────────────────────────────────────────────────────
   Countries & cohorts are DATA, not code — adding Ghana's first class or a
   fifth country is an admin action, never a deploy.
   ────────────────────────────────────────────────────────────────────────── */

export const countryStatus = pgEnum("country_status", ["active", "launching", "planned"]);

export const countries = pgTable("countries", {
  code: text("code").primaryKey(), // ISO alpha-2: NG, SN, KE, GH
  name: text("name").notNull(),
  flag: text("flag").notNull(), // emoji
  status: countryStatus("status").notNull().default("planned"), // active = has graduates
  admissionsOpen: boolean("admissions_open").notNull().default(false),
  admissionsEmail: text("admissions_email"),
  applyUrl: text("apply_url"),
  blurb: text("blurb"),
  partner: text("partner"), // e.g. "Université Cheikh Anta Diop, Dakar"
  sortOrder: integer("sort_order").notNull().default(0),
});

export const cohorts = pgTable("cohorts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // ng-2021, sn-2025, ke-2026
  countryCode: text("country_code").notNull().references(() => countries.code),
  name: text("name").notNull(), // "Class of 2021", "Pioneer Class"
  year: integer("year").notNull(), // graduation year
  sourceLabel: text("source_label"), // the "Class" value used in imported CSVs
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ── Graduates ────────────────────────────────────────────────────────────── */

export const officeStatus = pgEnum("office_status", ["none", "aspirant", "candidate", "appointed", "elected"]);

export const graduates = pgTable(
  "graduates",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    fullName: text("full_name").notNull(),
    cohortId: integer("cohort_id").notNull().references(() => cohorts.id),
    // PRIVATE — never selected into public queries (see src/lib/queries.ts publicGraduateColumns)
    email: text("email"), // null = no email on file yet (cannot self-verify until an admin adds one)
    altEmails: text("alt_emails"), // extra addresses from the registry, comma-separated; also accepted for verification
    phone: text("phone"),
    matricNumber: text("matric_number"),
    stateOfResidence: text("state_of_residence"),
    // PUBLIC — editable by the graduate once verified
    headline: text("headline"), // current role, e.g. "Special Adviser, Lagos State"
    bio: text("bio"),
    photoUrl: text("photo_url"),
    location: text("location"),
    linkedinUrl: text("linkedin_url"),
    xUrl: text("x_url"),
    facebookUrl: text("facebook_url"),
    // Admin-managed
    officeStatus: officeStatus("office_status").notNull().default("none"),
    officeTitle: text("office_title"),
    isHidden: boolean("is_hidden").notNull().default(false),
    isSample: boolean("is_sample").notNull().default(false), // demo persona — removable in one click, excluded from totals
    profileClaimedAt: timestamp("profile_claimed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("graduates_email_idx").on(t.email),
    index("graduates_cohort_idx").on(t.cohortId),
    index("graduates_name_idx").on(t.fullName),
  ],
);

/** One-time codes emailed to a graduate to prove they own a profile. */
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  graduateId: integer("graduate_id").notNull().references(() => graduates.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ── Admins (SPLN directors / secretariat) ────────────────────────────────── */

export const adminRole = pgEnum("admin_role", ["super_admin", "editor"]);

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRole("role").notNull().default("editor"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ── Editable headline numbers ───────────────────────────────────────────── */

export const stats = pgTable("stats", {
  key: text("key").primaryKey(), // aspirants, candidates, appointed, elected …
  label: text("label").notNull(),
  value: integer("value").notNull().default(0),
  suffix: text("suffix").default(""), // "+", "%"
  detail: text("detail"), // "Nigeria 30 · Senegal 3"
  group: text("group").notNull().default("public_office"),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ── Insights: news, articles, thought leadership ────────────────────────── */

export const postType = pgEnum("post_type", ["news", "article", "thought_leadership"]);
export const postStatus = pgEnum("post_status", ["draft", "pending", "changes_requested", "published", "rejected"]);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    type: postType("type").notNull().default("article"),
    status: postStatus("status").notNull().default("draft"),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull(), // markdown
    coverUrl: text("cover_url"),
    topic: text("topic"),
    sources: text("sources"), // references / data sources, one per line
    authorGraduateId: integer("author_graduate_id").references(() => graduates.id, { onDelete: "set null" }),
    authorAdminId: integer("author_admin_id").references(() => admins.id, { onDelete: "set null" }),
    authorName: text("author_name"), // byline override (e.g. "SPLN Secretariat")
    declarations: jsonb("declarations").$type<string[]>(), // standards the author attested to
    reviewNote: text("review_note"),
    reviewedById: integer("reviewed_by_id").references(() => admins.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    featured: boolean("featured").notNull().default(false),
    isSample: boolean("is_sample").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("posts_status_idx").on(t.status, t.publishedAt)],
);

/* ── Spotlight: what graduates are up to ─────────────────────────────────── */

export type GalleryItem = { url: string; caption?: string };
export type EvidenceLink = { url: string; label?: string };

export const spotlights = pgTable(
  "spotlights",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    graduateId: integer("graduate_id").notNull().references(() => graduates.id, { onDelete: "cascade" }),
    category: text("category").notNull(), // see SPOTLIGHT_CATEGORIES
    title: text("title").notNull(),
    summary: text("summary"),
    story: text("story").notNull(), // markdown
    coverUrl: text("cover_url"),
    gallery: jsonb("gallery").$type<GalleryItem[]>().default([]),
    evidenceLinks: jsonb("evidence_links").$type<EvidenceLink[]>().default([]),
    isPublished: boolean("is_published").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    isSample: boolean("is_sample").notNull().default(false),
    createdById: integer("created_by_id").references(() => admins.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("spotlights_pub_idx").on(t.isPublished, t.publishedAt)],
);

/* ── Gallery: photos by country, class and occasion ─────────────────────────── */

export const galleryPhotos = pgTable(
  "gallery_photos",
  {
    id: serial("id").primaryKey(),
    url: text("url").notNull(),
    width: integer("width"),
    height: integer("height"),
    caption: text("caption"),
    countryCode: text("country_code").notNull().references(() => countries.code),
    cohortId: integer("cohort_id").references(() => cohorts.id, { onDelete: "set null" }), // null = not tied to one class
    occasion: text("occasion").notNull().default("Graduation"), // Graduation · Induction · Convening · Workshop …
    featured: boolean("featured").notNull().default(false), // shown on the homepage strip + used as album cover
    isSample: boolean("is_sample").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdById: integer("created_by_id").references(() => admins.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("gallery_album_idx").on(t.countryCode, t.cohortId)],
);

/** Peer nominations / news tips for the Spotlight — reviewed in admin. */
export const nominations = pgTable("nominations", {
  id: serial("id").primaryKey(),
  nomineeName: text("nominee_name").notNull(),
  nomineeGraduateId: integer("nominee_graduate_id").references(() => graduates.id, { onDelete: "set null" }),
  nominatorName: text("nominator_name").notNull(),
  nominatorEmail: text("nominator_email").notNull(),
  reason: text("reason").notNull(),
  evidenceUrl: text("evidence_url"),
  status: text("status").notNull().default("new"), // new | reviewed | featured | declined
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Who changed what — directors share an admin area, so keep a trail. */
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actor: text("actor").notNull(), // "admin:3" | "graduate:120"
  action: text("action").notNull(),
  target: text("target"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Country = typeof countries.$inferSelect;
export type Cohort = typeof cohorts.$inferSelect;
export type Graduate = typeof graduates.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Spotlight = typeof spotlights.$inferSelect;
export type Stat = typeof stats.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
