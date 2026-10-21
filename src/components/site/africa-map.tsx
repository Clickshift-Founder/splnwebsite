import map from "@/content/africa-dots.json";
import { ACCENT_HEX, countryAccent } from "@/lib/brand";

type MapCountry = { code: string; name: string; flag: string; graduates: number; status: string };

const { width: W, height: H, dots, centroids } = map as unknown as {
  width: number;
  height: number;
  dots: [number, number, string][];
  centroids: Record<string, [number, number]>;
};

/**
 * Dot-matrix Africa with SPPG countries lit in their frame colours, pulsing pins and
 * network arcs between them. Pure SVG (server-rendered); motion is CSS and respects
 * prefers-reduced-motion. New countries light up automatically from the DB.
 */
export function AfricaMap({ countries, className }: { countries: MapCountry[]; className?: string }) {
  const lit = new Map(countries.map((c, i) => [c.code, { ...c, color: ACCENT_HEX[countryAccent(c.code, i)] }]));
  const pins = countries.filter((c) => centroids[c.code]);

  // Arcs: connect every lit country to the network's origin (first country), plus a ring between neighbours.
  const arcs: [string, string][] = [];
  for (let i = 1; i < pins.length; i++) arcs.push([pins[0].code, pins[i].code]);
  for (let i = 1; i < pins.length - 1; i++) arcs.push([pins[i].code, pins[i + 1].code]);

  return (
    <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} className={className} role="img" aria-label={`Map of Africa highlighting ${pins.map((p) => p.name).join(", ")}`}>
      <defs>
        <radialGradient id="pinGlow">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g>
        {dots.map(([x, y, code], i) => {
          const c = lit.get(code);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={c ? 0.46 : 0.36}
              fill={c ? c.color : "currentColor"}
              opacity={c ? (c.status === "active" ? 1 : 0.75) : 0.2}
            />
          );
        })}
      </g>

      <g fill="none" strokeWidth={0.22} strokeLinecap="round">
        {arcs.map(([a, b], i) => {
          const [x1, y1] = centroids[a];
          const [x2, y2] = centroids[b];
          const mx = (x1 + x2) / 2;
          const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.28 - 2;
          return (
            <path
              key={`${a}-${b}`}
              d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
              stroke="#fff"
              strokeOpacity={0.55}
              strokeDasharray="0.8 0.9"
              className="motion-safe:animate-[dash_3s_linear_infinite]"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          );
        })}
      </g>

      {/* Callout labels: sorted west→east, alternating above/below so close neighbours never collide. */}
      {[...pins]
        .sort((a, b) => centroids[a.code][0] - centroids[b.code][0])
        .map((p, i) => {
          const [x, y] = centroids[p.code];
          const color = lit.get(p.code)!.color;
          const above = i % 2 === 0;
          const ly = above ? y - 7 : y + 6.5;
          const anchor = x < 12 ? "start" : x > W - 14 ? "end" : "middle";
          const lx = anchor === "start" ? x - 1.5 : anchor === "end" ? x + 1.5 : x;
          return (
            <g key={p.code}>
              <line x1={x} y1={y + (above ? -1.2 : 1.2)} x2={x} y2={above ? ly + 3.4 : ly - 2.6} stroke={color} strokeWidth={0.18} />
              <circle cx={x} cy={y} r={1.1} fill={color} className="origin-center motion-safe:animate-pulse-ring" style={{ transformBox: "fill-box" }} />
              <circle cx={x} cy={y} r={1.05} fill="#fff" />
              <circle cx={x} cy={y} r={0.6} fill={color} />
              <g transform={`translate(${lx} ${ly})`} textAnchor={anchor} stroke="#0e1512" strokeWidth={0.7} paintOrder="stroke" strokeLinejoin="round">
                <text fontSize={2.5} fontWeight={800} fill="#fff">
                  {p.name}
                </text>
                <text y={2.5} fontSize={1.75} fontWeight={700} fill="#fff" fillOpacity={0.72}>
                  {p.graduates > 0 ? `${p.graduates.toLocaleString("en-GB")} graduates` : "Admissions in progress"}
                </text>
              </g>
            </g>
          );
        })}
      <style>{`@keyframes dash { to { stroke-dashoffset: -6.8; } }`}</style>
    </svg>
  );
}
