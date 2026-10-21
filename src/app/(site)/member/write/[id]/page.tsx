import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { MemberShell } from "@/components/site/member-shell";
import { requireMember } from "@/lib/auth";
import { POST_STATUS } from "@/lib/brand";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Edit article", robots: { index: false } };

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const me = await requireMember("/member");
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [p] = await db.select().from(posts).where(and(eq(posts.id, Number(id)), eq(posts.authorGraduateId, me.id)));
  if (!p || ["published", "rejected"].includes(p.status)) notFound();

  return (
    <MemberShell title={p.title} eyebrow={`Article · ${POST_STATUS[p.status].label}`} active="/member/write">
      {saved && <p className="mb-6 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">Draft saved.</p>}
      {p.reviewNote && p.status === "changes_requested" && (
        <div className="mb-8 rounded-[12px] border-l-4 border-blue bg-blue-tint p-5">
          <p className="font-extrabold">The editors asked for changes</p>
          <p className="mt-1">{p.reviewNote}</p>
        </div>
      )}
      <PostForm draft={p} />
    </MemberShell>
  );
}
