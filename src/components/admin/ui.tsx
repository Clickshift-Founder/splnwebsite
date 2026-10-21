import Link from "next/link";
import { cn } from "@/lib/brand";

export function AdminHeader({ title, sub, actions, back }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="text-sm font-bold text-slate hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="mt-1 text-3xl font-black tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-slate">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-[12px] border border-line bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="font-extrabold">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate [&_thead]:border-b [&_thead]:border-line [&_thead]:bg-sand [&_tr+tr]:border-t [&_tr+tr]:border-line">
        {children}
      </table>
    </div>
  );
}

export function StatCard({ label, value, href, tone = "default" }: { label: string; value: number | string; href?: string; tone?: "default" | "alert" }) {
  const body = (
    <div className={cn("rounded-[12px] border p-5 transition-colors", tone === "alert" ? "border-amber bg-amber-tint" : "border-line bg-white", href && "hover:border-ink/30")}>
      <p className="text-sm font-bold text-slate">{label}</p>
      <p className="mt-1 text-3xl font-black tabular-nums">{typeof value === "number" ? value.toLocaleString("en-GB") : value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
