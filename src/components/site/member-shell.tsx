import Link from "next/link";
import { LogOut } from "lucide-react";
import { FrameBar } from "@/components/ui/primitives";
import { signOutMember } from "@/app/(site)/claim/actions";

const TABS = [
  { href: "/member", label: "Dashboard" },
  { href: "/member/profile", label: "My profile" },
  { href: "/member/write", label: "Write" },
];

export function MemberShell({ title, eyebrow = "Your SPLN", active, children }: { title: string; eyebrow?: string; active: string; children: React.ReactNode }) {
  return (
    <>
      <section className="grain relative overflow-hidden bg-night text-white">
        <div className="absolute -right-20 -top-20 size-96 rounded-full bg-green/20 blur-3xl" aria-hidden />
        <div className="container-x relative pt-32 md:pt-40">
          <p className="eyebrow text-white/70">{eyebrow}</p>
          <FrameBar className="mt-4" />
          <h1 className="mt-5 text-3xl font-black tracking-[-0.03em] md:text-5xl">{title}</h1>
          <nav className="mt-8 flex items-end justify-between gap-4" aria-label="Member">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={
                    active === t.href
                      ? "rounded-t-[8px] bg-white px-4 py-3 text-sm font-extrabold text-ink"
                      : "rounded-t-[8px] px-4 py-3 text-sm font-bold text-white/70 hover:text-white"
                  }
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <form action={signOutMember}>
              <button className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-white/60 hover:text-white">
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </nav>
        </div>
      </section>
      <div className="container-x py-10 md:py-14">{children}</div>
    </>
  );
}
