// Brand marks (Lucide dropped brand icons in v1). 24×24, currentColor.
type P = { className?: string };

export const XIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const LinkedInIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const FacebookIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.684 4.533-4.684 1.312 0 2.686.235 2.686.235v2.963H15.83c-1.491 0-1.956.931-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

export function SocialLinks({
  x,
  linkedin,
  facebook,
  className,
  iconClass = "size-4",
}: {
  x?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  className?: string;
  iconClass?: string;
}) {
  const items = [
    { url: linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { url: x, label: "X (Twitter)", Icon: XIcon },
    { url: facebook, label: "Facebook", Icon: FacebookIcon },
  ].filter((i) => i.url);
  if (!items.length) return null;
  return (
    <div className={className ?? "flex items-center gap-2"}>
      {items.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url!}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={label}
          className="grid size-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
        >
          <Icon className={iconClass} />
        </a>
      ))}
    </div>
  );
}
