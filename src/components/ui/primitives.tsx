import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ACCENT_TINT, cn, countryAccent, type Accent } from "@/lib/brand";
import { initials } from "@/lib/text";

/* ── FrameBar: the four-colour rule from the SPPG mark (BRAND.md §2) ── */
export function FrameBar({ className, thick = false }: { className?: string; thick?: boolean }) {
  return (
    <div className={cn("flex w-16 gap-0.5", thick ? "h-1.5" : "h-1", className)} aria-hidden>
      <span className="flex-1 rounded-full bg-green" />
      <span className="flex-1 rounded-full bg-blue" />
      <span className="flex-1 rounded-full bg-red" />
      <span className="flex-1 rounded-full bg-amber" />
    </div>
  );
}

export function FrameEdge({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-1 w-full", className)} aria-hidden>
      <span className="flex-1 bg-green" />
      <span className="flex-1 bg-blue" />
      <span className="flex-1 bg-red" />
      <span className="flex-1 bg-amber" />
    </div>
  );
}

/* ── Section heading ── */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  dark = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <div className={cn("mb-5 flex flex-col gap-3", align === "center" && "items-center")}>
          <p className={cn("eyebrow", dark ? "text-white/70" : "text-slate")}>{eyebrow}</p>
          <FrameBar />
        </div>
      )}
      <h2 className={cn("text-3xl font-extrabold leading-[1.08] md:text-[2.75rem]", dark ? "text-white" : "text-ink")}>{title}</h2>
      {lead && <p className={cn("mt-5 text-lg leading-relaxed md:text-xl", dark ? "text-white/75" : "text-slate")}>{lead}</p>}
    </div>
  );
}

/* ── Buttons ── */
type ButtonVariant = "primary" | "secondary" | "light" | "ghost" | "ghost-light" | "danger";
const BTN: Record<ButtonVariant, string> = {
  primary: "bg-green text-white hover:bg-green-deep shadow-[0_8px_24px_-12px_rgba(5,175,75,0.7)]",
  secondary: "border border-ink/80 text-ink hover:bg-ink hover:text-white",
  light: "bg-white text-ink hover:bg-sand",
  ghost: "text-ink hover:bg-ink/5",
  "ghost-light": "border border-white/30 text-white hover:bg-white/10",
  danger: "bg-red text-white hover:bg-red/90",
};
const SIZE = { sm: "h-9 px-3.5 text-sm", md: "h-11 px-5 text-[0.95rem]", lg: "h-13 px-7 text-base" };

export function buttonClass(variant: ButtonVariant = "primary", size: keyof typeof SIZE = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[4px] font-bold tracking-tight transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
    BTN[variant],
    SIZE[size],
    className,
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: keyof typeof SIZE;
  arrow?: boolean;
  className?: string;
  external?: boolean;
}) {
  const ext = external ?? href.startsWith("http");
  return (
    <Link
      href={href}
      className={cn(buttonClass(variant, size, className), "group")}
      {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {arrow && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />}
    </Link>
  );
}

export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-1.5 font-bold text-green-deep hover:text-green", className)}>
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
    </Link>
  );
}

/* ── Badge / chip ── */
export function Badge({ children, accent, className }: { children: React.ReactNode; accent?: Accent; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
        accent ? ACCENT_TINT[accent] : "bg-sand text-slate ring-1 ring-line",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Avatar: photo, or initials on the country's frame colour ── */
const AV_BG: Record<Accent, string> = {
  green: "from-green to-green-deep",
  blue: "from-blue to-[#0079a8]",
  red: "from-red to-[#a30710]",
  amber: "from-amber to-[#d4870a]",
};

export function Avatar({
  name,
  src,
  countryCode,
  size = 56,
  className,
  rounded = "full",
}: {
  name: string;
  src?: string | null;
  countryCode?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "lg";
}) {
  const r = rounded === "full" ? "rounded-full" : "rounded-[12px]";
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 object-cover", r, className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn("grid shrink-0 place-items-center bg-gradient-to-br font-extrabold text-white", AV_BG[countryAccent(countryCode)], r, className)}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.34) }}
    >
      {initials(name)}
    </div>
  );
}

/* ── Empty state ── */
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-dashed border-line bg-sand px-6 py-14 text-center">
      <FrameBar className="mx-auto mb-5" />
      <p className="text-xl font-extrabold">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-slate">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ── Page hero for inner pages ── */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden bg-night text-white">
      {image && (
        <>
          <Image src={image} alt="" fill priority className="object-cover opacity-35" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/30" />
        </>
      )}
      <div className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-green/20 blur-3xl" aria-hidden />
      <div className="container-x relative pb-16 pt-36 md:pb-24 md:pt-44">
        <p className="eyebrow text-white/70">{eyebrow}</p>
        <FrameBar className="mt-4" />
        <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-[-0.025em] md:text-6xl">{title}</h1>
        {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
