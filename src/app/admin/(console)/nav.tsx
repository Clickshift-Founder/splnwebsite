"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Globe2, Images, LayoutDashboard, Megaphone, Sparkles, UserCog, Users } from "lucide-react";
import { cn } from "@/lib/brand";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Insights & review", Icon: FileText },
  { href: "/admin/spotlights", label: "Spotlight", Icon: Sparkles },
  { href: "/admin/nominations", label: "Nominations", Icon: Megaphone },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/graduates", label: "Graduates", Icon: Users },
  { href: "/admin/stats", label: "Numbers", Icon: BarChart3 },
  { href: "/admin/countries", label: "Countries & classes", Icon: Globe2, superOnly: true },
  { href: "/admin/admins", label: "Admins & security", Icon: UserCog },
];

export function AdminNav({ isSuper }: { isSuper: boolean }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-6" aria-label="Admin">
      {ITEMS.filter((i) => !i.superOnly || isSuper).map(({ href, label, Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-bold transition-colors",
              active ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
