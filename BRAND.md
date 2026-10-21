# SPLN Brand Guide

The SPPG Public Leaders Network is a member of the **SPPG family**. It does not have a separate brand — it
wears the School of Politics, Policy & Governance identity (thesppg.org), with the network's own logo lock-up.
When in doubt, do what thesppg.org does.

---

## 1. Logo

| Asset | File | Use on |
|---|---|---|
| Full lock-up (dark text) | `public/brand/spln-logo.png` | White / light backgrounds |
| Full lock-up (light text) | `public/brand/spln-logo-light.png` | Ink / dark / photo backgrounds |
| Mark only (the SPPG frame) | `public/brand/spln-mark.png` | Favicons, avatars, compact headers, social cards |

The lock-up reads: **SCHOOL OF POLITICS, POLICY & GOVERNANCE / PUBLIC LEADERS NETWORK**, beside the SPPG frame mark.

**Do:** keep clear space equal to the height of the frame's top bar on all sides · minimum width 180px for the full lock-up, 28px for the mark.
**Don't:** recolour the frame · place the dark lock-up on photography · stretch, rotate, outline or add effects · recreate the logo in type.

## 2. The Frame — our signature motif

The mark is a square framed by four coloured bars around a green-to-blue tile. That frame is the
system's one graphic idea; use it, and very little else.

```
          RED  (top)
 GREEN  [ tile ]  BLUE
        AMBER (bottom)
```

- **Frame bar** (`<FrameBar />`): a 4-segment rule (green · blue · red · amber), used under section eyebrows, at the top of cards and as the footer edge.
- **Frame corners**: thin coloured corner brackets on feature images.
- **Tile gradient**: `linear-gradient(135deg, #05AF4B → #009CD9)` — reserved for primary highlights (the hero accent, focus moments, the "you're in" state). Never on body text blocks.

## 3. Colour

Taken directly from thesppg.org's CSS tokens.

| Token | Hex | Role |
|---|---|---|
| `green` | `#05AF4B` | **Primary.** CTAs, links, active states. Nigeria |
| `green-deep` | `#05893C` | Hover / pressed primary, text on green-tint |
| `green-tint` | `#E9F6EE` | Soft backgrounds, success states |
| `blue` | `#009CD9` | Secondary accent, data, info. Kenya |
| `red` | `#D80A15` | Emphasis sparingly; errors. Never for large fills. Senegal accent |
| `amber` | `#F2A421` | Highlights, badges, "new". Ghana accent |
| `ink` | `#1A1A1A` | Primary text; dark sections |
| `night` | `#0E1512` | Deep dark sections (green-black), hero backgrounds |
| `slate` | `#55606B` | Secondary text |
| `line` | `#E7E4DD` | Borders, dividers (warm) |
| `sand` | `#FAF8F4` | Alternate section background (warm off-white) |
| `paper` | `#FFFFFF` | Base background |

**Ratios:** ~70% paper/sand, ~20% ink/night, ~10% colour. Green leads; the other three appear together
(as the frame) or as single small accents — never as competing large blocks.

**Country accents** (for maps, filters, chips): Nigeria → green · Kenya → blue · Senegal → red · Ghana → amber. New countries cycle the same four.

**Contrast:** body text is ink or slate on paper/sand. White text on green only at ≥ 18px bold. Amber is never a text colour on white.

## 4. Typography

SPPG uses **Museo Sans** (licensed, Adobe Fonts). The web build uses **Nunito Sans** — the same
humanist-geometric feel and SPPG's own web fallback. If SPPG later provides an Adobe Fonts kit, swap the
`--font-sans` token; nothing else changes.

| Style | Size (desktop / mobile) | Weight | Tracking |
|---|---|---|---|
| Display (hero) | 72 / 44 px | 800 | -0.03em |
| H1 | 56 / 38 | 800 | -0.025em |
| H2 | 40 / 30 | 800 | -0.02em |
| H3 | 24 / 20 | 700 | -0.01em |
| Eyebrow | 12–13 px, UPPERCASE | 800 | +0.16em |
| Body large | 20 / 18 | 400 | 0 |
| Body | 16–17 | 400 | 0 |
| Small / meta | 13–14 | 600 | 0 |

The eyebrow echoes the logo's "SCHOOL OF POLITICS, POLICY & GOVERNANCE" line: small, wide-tracked caps above every section heading, followed by a Frame bar.

Numbers (stats) use tabular figures and weight 800.

## 5. Photography

- **Real people, real moments.** Graduations, classrooms, convenings, flags, embraces. Documentary, not stock.
- Warm, natural light. Groups that show scale; close-ups that show emotion.
- Represent every country and gender balance (SPPG is ~43% women).
- On dark sections, photos sit under a night→transparent gradient so text stays legible.
- Graduate portraits: square crop, face centred, plain or blurred background. Fallback avatar = initials on a tile using the country accent.

## 6. Voice & tone

SPPG's voice: **aspirational, confident, mission-driven, plain-spoken.** Short sentences. Parallel structure. Pan-African.

- Write as "we" (the network) to "you" (the reader).
- Concrete over abstract: "33 graduates in appointed office" beats "many graduates are making an impact".
- British spelling: programme, organise, centre, analyse.
- Non-partisan: never name parties in our own voice; never endorse.
- Signature lines we reuse: *Character · Competence · Capacity* · *Run to Win. Govern Good.* · *Welcome home.* · *Don't do politics alone.* · *#FixPolitics*
- Selectivity is part of the story — say it with pride, not gatekeeping: "a tiny fraction are admitted", "you can't buy a seat here — you earn it".

## 7. UI patterns

- **Radius:** 4px controls, 8px small cards, 16px feature cards, full for avatars/chips. Sharp-ish — institutional, not bubbly.
- **Elevation:** borders (`line`) first, shadows rarely and soft.
- **Buttons:** Primary = green fill, white text. Secondary = ink outline. On dark = white fill, ink text. Arrow "→" on forward CTAs.
- **Cards:** paper on sand, 1px line border, Frame bar or coloured top edge for featured.
- **Motion:** subtle — fade/slide 12px on scroll, counters on stats, a slow pulse on map pins. Always disabled under `prefers-reduced-motion`.
- **Icons:** Lucide, 1.75 stroke. Social brand marks are custom SVG in `components/ui/social-icons.tsx`.

## 8. Naming

- Full: **SPPG Public Leaders Network**. Short: **SPLN**. Never "SPPG Alumni Association" (retired name).
- People: "graduates" (preferred) or "members". Not "alumni" in headlines.
- Programme: "Certificate in Public Leadership & Policy (CPLP)", "the 10-month programme".
- Two different spotlights: **Spotlight** (what graduates are up to — site section) vs. **Spotlight Series: SPLN in Public Service** (structured reflections from office-holders — a Spotlight category).
