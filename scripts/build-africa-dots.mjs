// Generates src/content/africa-dots.json — a dot-matrix map of Africa used by <AfricaMap />.
// Run once (or when adding a country): `npm run map:build`. Needs network to fetch world-atlas.
import { writeFileSync } from "node:fs";
import { geoContains, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";

const SRC = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";

// ISO 3166 numeric → ISO alpha-2 for every African state
const AFRICA = {
  12: "DZ", 24: "AO", 204: "BJ", 72: "BW", 854: "BF", 108: "BI", 120: "CM", 132: "CV", 140: "CF",
  148: "TD", 174: "KM", 178: "CG", 180: "CD", 384: "CI", 262: "DJ", 818: "EG", 226: "GQ", 232: "ER",
  748: "SZ", 231: "ET", 266: "GA", 270: "GM", 288: "GH", 324: "GN", 624: "GW", 404: "KE", 426: "LS",
  430: "LR", 434: "LY", 450: "MG", 454: "MW", 466: "ML", 478: "MR", 480: "MU", 504: "MA", 508: "MZ",
  516: "NA", 562: "NE", 566: "NG", 646: "RW", 678: "ST", 686: "SN", 690: "SC", 694: "SL", 706: "SO",
  710: "ZA", 728: "SS", 729: "SD", 834: "TZ", 768: "TG", 788: "TN", 800: "UG", 732: "EH", 894: "ZM",
  716: "ZW",
};

const STEP = 1.15; // degrees between dots
const BOX = { west: -18, east: 52, north: 38, south: -35.5 };

const topo = await (await fetch(SRC)).json();
const countries = feature(topo, topo.objects.countries).features
  .map((f) => ({ ...f, code: AFRICA[Number(f.id)] ?? (f.properties?.name === "Somaliland" ? "SO" : null) }))
  .filter((f) => f.code);

const dots = [];
for (let lat = BOX.north; lat >= BOX.south; lat -= STEP) {
  for (let lon = BOX.west; lon <= BOX.east; lon += STEP) {
    const hit = countries.find((c) => geoContains(c, [lon, lat]));
    if (hit) dots.push([+(lon - BOX.west).toFixed(2), +(BOX.north - lat).toFixed(2), hit.code]);
  }
}

// Centroids let the component place labels/pins for any country we expand into.
const centroids = Object.fromEntries(
  countries.map((c) => {
    const [lon, lat] = geoCentroid(c);
    return [c.code, [+(lon - BOX.west).toFixed(2), +(BOX.north - lat).toFixed(2)]];
  }),
);

const out = {
  width: +(BOX.east - BOX.west).toFixed(2),
  height: +(BOX.north - BOX.south).toFixed(2),
  step: STEP,
  dots,
  centroids,
};
writeFileSync(new URL("../src/content/africa-dots.json", import.meta.url), JSON.stringify(out));
console.log(`Wrote ${dots.length} dots, ${Object.keys(centroids).length} centroids`);
