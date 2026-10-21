import { cn } from "@/lib/brand";

/**
 * SVG national flags. Windows has no flag emoji (renders "NG", "KE"…), so we draw them.
 * Adding a country? Add its flag here; unknown codes fall back to the emoji from the DB.
 */
const FLAGS: Record<string, React.ReactNode> = {
  NG: (
    <>
      <rect width="3" height="2" fill="#fff" />
      <rect width="1" height="2" fill="#008751" />
      <rect x="2" width="1" height="2" fill="#008751" />
    </>
  ),
  SN: (
    <>
      <rect width="1" height="2" fill="#00853F" />
      <rect x="1" width="1" height="2" fill="#FDEF42" />
      <rect x="2" width="1" height="2" fill="#E31B23" />
      <path d="M1.5 0.62l0.12 0.37h0.39l-0.31 0.23 0.12 0.37-0.32-0.23-0.32 0.23 0.12-0.37-0.31-0.23h0.39z" fill="#00853F" />
    </>
  ),
  KE: (
    <>
      <rect width="3" height="2" fill="#fff" />
      <rect width="3" height="0.6" fill="#000" />
      <rect y="0.72" width="3" height="0.56" fill="#BB0000" />
      <rect y="1.4" width="3" height="0.6" fill="#006600" />
      <ellipse cx="1.5" cy="1" rx="0.28" ry="0.62" fill="#BB0000" stroke="#000" strokeWidth="0.04" />
      <ellipse cx="1.5" cy="1" rx="0.08" ry="0.5" fill="#000" />
    </>
  ),
  GH: (
    <>
      <rect width="3" height="0.667" fill="#CE1126" />
      <rect y="0.667" width="3" height="0.667" fill="#FCD116" />
      <rect y="1.333" width="3" height="0.667" fill="#006B3F" />
      <path d="M1.5 0.72l0.075 0.23h0.24l-0.195 0.142 0.075 0.23-0.195-0.142-0.195 0.142 0.075-0.23-0.195-0.142h0.24z" fill="#000" />
    </>
  ),
};

export function Flag({ code, emoji, className, title }: { code: string; emoji?: string; className?: string; title?: string }) {
  const f = FLAGS[code];
  if (!f) return <span className={className}>{emoji}</span>;
  return (
    <svg
      viewBox="0 0 3 2"
      className={cn("inline-block h-[0.8em] w-[1.2em] shrink-0 rounded-[2px] align-[-0.06em] shadow-[0_0_0_0.5px_rgba(0,0,0,0.25)]", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {f}
    </svg>
  );
}
