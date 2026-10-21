"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, UserRound, ArrowUpRight } from "lucide-react";
import { NAV, SITE } from "@/content/site";
import { buttonClass } from "@/components/ui/primitives";
import { cn } from "@/lib/brand";
import { Flag } from "@/components/ui/flag";

type Props = {
  member: { slug: string; fullName: string } | null;
  admissions: { code: string; flag: string; name: string }[];
};

export function SiteHeader({ member, admissions }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Admissions bar — the single most important CTA on the site */}
      <div
        className={cn(
          "tile-gradient overflow-hidden text-white transition-[max-height] duration-300",
          scrolled ? "max-h-0" : "max-h-12",
        )}
      >
        <Link
          href={SITE.applyUrl}
          target="_blank"
          className="container-x flex h-9 items-center justify-center gap-2 text-[0.8rem] font-bold md:text-sm"
        >
          <span className="hidden sm:inline">Admissions open for the next SPPG class —</span>
          <span className="sm:hidden">Admissions open —</span>
          <span className="flex items-center gap-1" aria-label={admissions.map((a) => a.name).join(", ")}>
            {admissions.map((a) => (
              <Flag key={a.code} code={a.code} emoji={a.flag} />
            ))}
          </span>
          <span className="underline underline-offset-2">Apply now</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div
        className={cn(
          "transition-colors duration-300",
          solid ? "border-b border-line bg-white/95 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
          <Link href="/" className="relative block h-7 w-[212px] shrink-0 md:h-8 md:w-[256px]" aria-label="SPPG Public Leaders Network — home">
            <Image
              src="/brand/spln-logo-light.png"
              alt=""
              fill
              priority
              sizes="256px"
              className={cn("object-contain object-left transition-opacity", solid ? "opacity-0" : "opacity-100")}
            />
            <Image
              src="/brand/spln-logo.png"
              alt=""
              fill
              priority
              sizes="256px"
              className={cn("object-contain object-left transition-opacity", solid ? "opacity-100" : "opacity-0")}
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "relative rounded-[4px] px-3 py-2 text-[0.92rem] font-bold transition-colors",
                    solid ? "text-ink hover:bg-ink/5" : "text-white/90 hover:text-white",
                    active && (solid ? "text-green-deep" : "text-white"),
                  )}
                >
                  {n.label}
                  {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-green" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href={member ? "/member" : "/claim"}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[4px] px-3 text-sm font-bold transition-colors",
                solid ? "text-ink hover:bg-ink/5" : "text-white hover:bg-white/10",
              )}
            >
              <UserRound className="size-4" />
              {member ? member.fullName.split(" ")[0] : "Graduate sign in"}
            </Link>
            <Link href="/join" className={buttonClass(solid ? "primary" : "light", "sm", "h-10 px-4")}>
              How to join
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn("grid size-10 place-items-center rounded-[4px] lg:hidden", solid ? "text-ink" : "text-white")}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-white transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav className="container-x flex flex-col py-6" aria-label="Mobile">
          {[{ href: "/", label: "Home" }, ...NAV, { href: "/join", label: "How to join" }, { href: "/events", label: "Events" }, { href: "/write", label: "Write for SPLN" }].map((n) => (
            <Link key={n.href} href={n.href} className="border-b border-line py-4 text-2xl font-extrabold tracking-tight">
              {n.label}
            </Link>
          ))}
          <div className="mt-8 grid gap-3">
            <Link href={SITE.applyUrl} target="_blank" className={buttonClass("primary", "lg", "w-full")}>
              Apply to SPPG
            </Link>
            <Link href={member ? "/member" : "/claim"} className={buttonClass("secondary", "lg", "w-full")}>
              {member ? "My SPLN profile" : "Graduate sign in"}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
