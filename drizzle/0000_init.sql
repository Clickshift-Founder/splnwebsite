CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'editor');--> statement-breakpoint
CREATE TYPE "public"."country_status" AS ENUM('active', 'launching', 'planned');--> statement-breakpoint
CREATE TYPE "public"."office_status" AS ENUM('none', 'aspirant', 'candidate', 'appointed', 'elected');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'pending', 'changes_requested', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('news', 'article', 'thought_leadership');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"country_code" text NOT NULL,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"source_label" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "cohorts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"flag" text NOT NULL,
	"status" "country_status" DEFAULT 'planned' NOT NULL,
	"admissions_open" boolean DEFAULT false NOT NULL,
	"admissions_email" text,
	"apply_url" text,
	"blurb" text,
	"partner" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "graduates" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"full_name" text NOT NULL,
	"cohort_id" integer NOT NULL,
	"email" text,
	"alt_emails" text,
	"phone" text,
	"matric_number" text,
	"state_of_residence" text,
	"headline" text,
	"bio" text,
	"photo_url" text,
	"location" text,
	"linkedin_url" text,
	"x_url" text,
	"facebook_url" text,
	"office_status" "office_status" DEFAULT 'none' NOT NULL,
	"office_title" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"profile_claimed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "graduates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "nominations" (
	"id" serial PRIMARY KEY NOT NULL,
	"nominee_name" text NOT NULL,
	"nominee_graduate_id" integer,
	"nominator_name" text NOT NULL,
	"nominator_email" text NOT NULL,
	"reason" text NOT NULL,
	"evidence_url" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"type" "post_type" DEFAULT 'article' NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"body" text NOT NULL,
	"cover_url" text,
	"topic" text,
	"sources" text,
	"author_graduate_id" integer,
	"author_admin_id" integer,
	"author_name" text,
	"declarations" jsonb,
	"review_note" text,
	"reviewed_by_id" integer,
	"reviewed_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "spotlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"graduate_id" integer NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"story" text NOT NULL,
	"cover_url" text,
	"gallery" jsonb DEFAULT '[]'::jsonb,
	"evidence_links" jsonb DEFAULT '[]'::jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by_id" integer,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spotlights_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"suffix" text DEFAULT '',
	"detail" text,
	"group" text DEFAULT 'public_office' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"graduate_id" integer NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_country_code_countries_code_fk" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graduates" ADD CONSTRAINT "graduates_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nominations" ADD CONSTRAINT "nominations_nominee_graduate_id_graduates_id_fk" FOREIGN KEY ("nominee_graduate_id") REFERENCES "public"."graduates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_graduate_id_graduates_id_fk" FOREIGN KEY ("author_graduate_id") REFERENCES "public"."graduates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_admin_id_admins_id_fk" FOREIGN KEY ("author_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_reviewed_by_id_admins_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlights" ADD CONSTRAINT "spotlights_graduate_id_graduates_id_fk" FOREIGN KEY ("graduate_id") REFERENCES "public"."graduates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlights" ADD CONSTRAINT "spotlights_created_by_id_admins_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_graduate_id_graduates_id_fk" FOREIGN KEY ("graduate_id") REFERENCES "public"."graduates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "graduates_email_idx" ON "graduates" USING btree ("email");--> statement-breakpoint
CREATE INDEX "graduates_cohort_idx" ON "graduates" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "graduates_name_idx" ON "graduates" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "spotlights_pub_idx" ON "spotlights" USING btree ("is_published","published_at");