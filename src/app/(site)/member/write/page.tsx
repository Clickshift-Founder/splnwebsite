import type { Metadata } from "next";
import { MemberShell } from "@/components/site/member-shell";
import { requireMember } from "@/lib/auth";
import { PostForm } from "./post-form";

export const metadata: Metadata = { title: "Write for SPLN", robots: { index: false } };

export default async function NewPostPage() {
  await requireMember("/member/write");
  return (
    <MemberShell title="Write for SPLN Insights" active="/member/write">
      <PostForm />
    </MemberShell>
  );
}
