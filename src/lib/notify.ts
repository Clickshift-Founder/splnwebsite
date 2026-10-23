import "server-only";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, graduates, posts } from "@/db/schema";
import { noticeEmail, sendEmail } from "./email";

/**
 * Email notifications for the editorial workflow. They run after the response is sent (`after`), so a slow or
 * failing email never blocks or breaks the action that triggered it. Failures are logged, never shown.
 */

const siteUrl = (path: string) => `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}${path}`;

function later(label: string, job: () => Promise<void>) {
  after(async () => {
    try {
      await job();
    } catch (e) {
      console.error(`[notify] ${label} failed`, e);
    }
  });
}

export type AuthorEvent = "published" | "changes_requested" | "rejected" | "unpublished";

/** Tells a graduate what happened to their piece. Staff posts (no graduate author) are skipped. */
export function notifyAuthor(postId: number, event: AuthorEvent) {
  later(`author ${event}`, async () => {
    const [row] = await db
      .select({ title: posts.title, slug: posts.slug, note: posts.reviewNote, name: graduates.fullName, email: graduates.email, altEmails: graduates.altEmails })
      .from(posts)
      .innerJoin(graduates, eq(posts.authorGraduateId, graduates.id))
      .where(eq(posts.id, postId));
    const to = row?.email ?? row?.altEmails?.split(",")[0];
    if (!row || !to) return;

    const greeting = `Hello ${row.name.split(" ")[0]},`;
    const title = `“${row.title}”`;
    const note = row.note ? { label: "Note from the editors", text: row.note } : null;
    const edit = { label: "Open your dashboard", url: siteUrl("/member") };
    const mail = {
      published: noticeEmail({
        subject: `Published: ${row.title}`,
        greeting,
        lines: [`Good news — your piece ${title} has been approved and is now live on SPLN Insights.`, "Thank you for writing for the network. Share it widely."],
        note,
        cta: { label: "Read it on SPLN", url: siteUrl(`/insights/${row.slug}`) },
      }),
      changes_requested: noticeEmail({
        subject: `Changes requested: ${row.title}`,
        greeting,
        lines: [`The SPLN editors have reviewed ${title} and asked for some changes before it can be published.`, "Make the changes in your dashboard, then press Submit for review again."],
        note,
        cta: edit,
      }),
      rejected: noticeEmail({
        subject: `Not accepted: ${row.title}`,
        greeting,
        lines: [`The SPLN editors have reviewed ${title} and haven't accepted it for publication.`, "You can revise it and submit it again from your dashboard, or start a new piece."],
        note,
        cta: edit,
      }),
      unpublished: noticeEmail({
        subject: `Unpublished: ${row.title}`,
        greeting,
        lines: [`The SPLN editors have taken ${title} off the website for now.`, "You can make the changes below and submit it for review again from your dashboard."],
        note: row.note ? { label: "Why it was unpublished", text: row.note } : null,
        cta: edit,
      }),
    }[event];
    await sendEmail({ to, ...mail });
  });
}

async function adminEmails() {
  const rows = await db.select({ email: admins.email }).from(admins).where(eq(admins.isActive, true));
  return rows.map((r) => r.email);
}

/** Tells every active admin that a graduate submitted (or resubmitted) a piece for review. */
export function notifyNewSubmission(postId: number) {
  later("new submission", async () => {
    const [row] = await db
      .select({ title: posts.title, name: graduates.fullName })
      .from(posts)
      .innerJoin(graduates, eq(posts.authorGraduateId, graduates.id))
      .where(eq(posts.id, postId));
    if (!row) return;
    const mail = noticeEmail({
      subject: `For review: ${row.title}`,
      greeting: "Hello,",
      lines: [`${row.name} has submitted “${row.title}” for editorial review.`, "Check it against the SPPG standard, then approve, request changes or decline."],
      cta: { label: "Review it", url: siteUrl(`/admin/posts/${postId}`) },
    });
    await Promise.all((await adminEmails()).map((to) => sendEmail({ to, ...mail })));
  });
}

/** Tells every active admin that a Spotlight nomination arrived. */
export function notifyNewNomination(nomineeName: string, nominatorName: string) {
  later("new nomination", async () => {
    const mail = noticeEmail({
      subject: `New Spotlight nomination: ${nomineeName}`,
      greeting: "Hello,",
      lines: [`${nominatorName} has nominated ${nomineeName} for the SPLN Spotlight.`, "Verify the story and get the graduate's consent before writing it up."],
      cta: { label: "Open nominations", url: siteUrl("/admin/nominations") },
    });
    await Promise.all((await adminEmails()).map((to) => sendEmail({ to, ...mail })));
  });
}
