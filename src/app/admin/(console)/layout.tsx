import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { FrameEdge } from "@/components/ui/primitives";
import { AdminNav } from "./nav";
import { adminLogout } from "../actions";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh bg-sand lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-night text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
        <FrameEdge />
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Link href="/admin">
            <Image src="/brand/spln-logo-light.png" alt="SPLN" width={220} height={27} className="h-auto w-[200px]" />
          </Link>
          <p className="eyebrow mt-3 hidden text-white/40 lg:block">Directors&apos; console</p>
        </div>
        <AdminNav isSuper={admin.role === "super_admin"} />
        <div className="border-t border-white/10 px-5 py-5 text-sm">
          <p className="font-bold">{admin.name}</p>
          <p className="truncate text-white/50">{admin.email}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" target="_blank" className="font-bold text-white/70 hover:text-white">
              View site ↗
            </Link>
            <form action={adminLogout}>
              <button className="font-bold text-white/70 hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
