# Ashom — UI Upgrade Design Brief
**Version:** 1.0  
**Date:** April 2026  
**Owner:** Aiman Sadeq, VIFM  

---

## Overview

This brief defines the full UI upgrade for the Ashom GCC Financial Intelligence platform. The goal is to transform the current functional interface into a **premium modern fintech product** — comparable in feel to Robinhood and Revolut — while preserving all existing functionality, routing, and data logic.

A fully approved HTML prototype of the Dashboard is included in the repo root as `ashom-dashboard.html`. Use it as the primary visual reference for the design system, spacing, card patterns, typography, and color usage.

---

## Design Direction

| Attribute | Decision |
|---|---|
| Theme | Light only |
| Style | Modern fintech — Robinhood / Revolut |
| Tone | Confident, clean, consumer-friendly |
| Target device | Mobile-first (430px), responsive up |
| Language | Bilingual — Arabic + English |

---

## Design Tokens

### Colors

```css
--navy:       #010131;   /* Primary — headers, text, logo bg */
--navy-soft:  #0a0a4a;   /* Hover states on navy */
--blue:       #5391D5;   /* Accent — links, active states, CTA */
--blue-light: #EAF2FC;   /* Active nav bg, icon bg */
--blue-mid:   #C5DEFA;   /* Borders on blue elements */
--green:      #00C896;   /* Positive / gain */
--green-bg:   #E6FAF5;   /* Positive badge background */
--red:        #FF4B6E;   /* Negative / loss */
--red-bg:     #FFF0F3;   /* Negative badge background */
--bg:         #F4F6FB;   /* Page background */
--card:       #FFFFFF;   /* Card background */
--border:     #E8ECF4;   /* Card and divider borders */
--text-1:     #010131;   /* Primary text */
--text-2:     #5A6480;   /* Secondary text */
--text-3:     #9AA3BD;   /* Muted / placeholder text */
```

### Typography

```css
--font-head: 'Sora', sans-serif;      /* All headings, card titles, numbers */
--font-body: 'DM Sans', sans-serif;   /* Body text, labels, nav items */
```

Import from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

In Tailwind config, extend fontFamily:
```js
fontFamily: {
  head: ['Sora', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
}
```

### Border Radius

```css
--r-sm: 10px;   /* Badges, small elements */
--r-md: 16px;   /* Cards, buttons, inputs */
--r-lg: 20px;   /* Large cards */
--r-xl: 24px;   /* Hero sections */
```

### Shadows

```css
/* Default card — no shadow */
/* Hover card */
box-shadow: 0 8px 24px rgba(1,1,49,0.09);
/* Nav / header blur */
backdrop-filter: blur(12px);
background: rgba(255,255,255,0.92);
```

---

## Component Patterns

### Header (Sticky)

- Frosted glass effect: `backdrop-filter: blur(12px)`, white 92% opacity
- Left: **أسهم** Arabic logo in a dark navy rounded square (42x42px) + "Ashom" in Sora bold + "GCC Financial Intelligence" in muted small text
- Right: Bell icon button (circular, bordered) + User avatar circle (navy bg, white initials)
- Border bottom: 1px `--border`

### Toggle (My Screen / Explore)

- Full-width pill container, white bg, bordered
- Active button: navy bg, white text, subtle box shadow
- Inactive button: transparent bg, muted text
- Both buttons have a small icon + label

### Market Ticker

- Horizontal scroll row, no scrollbar visible
- Each card: 130px min-width, white bg, bordered, 16px radius
- Contents: flag emoji + country code + exchange symbol, large bold number (Sora 20px 700), colored change badge, sparkline SVG
- Live dot indicator with pulse animation next to "Live · timestamp"
- Up changes: green text + green bg badge
- Down changes: red text + red bg badge

### Feature Cards (Grid)

- 2-column grid, 10px gap
- White bg, 1px border, 16px radius
- Icon wrap: 40x40px rounded square with colored background per category
- Category label: 10px uppercase muted, 0.8px letter spacing
- Title: Sora 14px 700, navy
- Subtitle: 11px muted
- Badges (LIVE / HOT / NEW): absolute positioned top-right, colored pill

**Icon color system:**

| Category | Icon bg | Icon color |
|---|---|---|
| Live / Metals | `#FFF0F3` | `#FF4B6E` |
| Crypto | `#FFF5ED` | `#FF8A35` |
| Companies / Analytics | `#EAF2FC` | `#5391D5` |
| Watchlist / Curated | `#FFF8E6` | `#F2A600` |
| Portfolio / Holdings | `#EAEBF7` | `#010131` |
| Simulator / Quant | `#F0EEFE` | `#7C5FDB` |
| Currency / Export | `#E6FAF5` | `#00C896` |
| Classroom / Live | `#E3F6F5` | `#00A8A0` |

### Feature Cards (Row / List variant)

Used in Discover and Research sections:
- Full-width, flex row
- Icon wrap (no bottom margin) + content block (category + title + subtitle) + chevron arrow circle
- Same hover lift animation as grid cards

### AI Promo Card

- Full-width, navy background (#010131)
- Decorative circles in top-right and bottom using semi-transparent blue
- Left: icon wrap (semi-transparent white bg) with AI icon
- Center: small uppercase label + bold white title + muted subtitle
- Right: CTA button (semi-transparent white border, white text)

### Bottom Navigation

- Fixed, max-width 430px, centered
- Frosted glass: `backdrop-filter: blur(12px)`, white 95% opacity
- 7 items: Home, Markets, AI, Analytics, Portfolio, News, Learning
- Active state: icon gets blue-light background pill, label turns blue
- Inactive: muted gray icon + label
- Padding: 8px top, 16px bottom (safe area)

---

## Screen-by-Screen Instructions

### 01. Dashboard / Home (`/`)

**Reference:** `ashom-dashboard.html` — implement this exactly.

Key sections in order:
1. Sticky header
2. My Screen / Explore toggle
3. GCC Markets ticker (horizontal scroll, 6 cards)
4. AI Financial Analyst promo card (navy, prominent)
5. Markets section (2x2 grid)
6. Portfolio section (2-col grid + 1 wide card)
7. Discover section (row list)
8. Research & Tools section (2x2 grid)
9. Fixed bottom nav

---

### 02. Analytics (`/analytics`)

Current: 3x3 grid of comparison type cards with colored icons and labels.

Upgrade instructions:
- Page header: bold "Analytics" title + "Choose your comparison type" subtitle, back arrow
- Section label: "COMPARISON TYPES" uppercase muted
- Cards: use the 2-column grid pattern from the design system
- Each card gets an appropriate icon color from the icon color system above
- Add a subtle description line under each card title (e.g. "Company vs Company → Compare two GCC companies head to head")
- No empty space below cards — add a tip card at the bottom: "Pro tip: Use the Wizard for guided step-by-step comparisons"

---

### 03. Markets (`/markets`)

Current: plain white list of regulatory bodies.

Upgrade instructions:
- Page header: "Capital Markets" + "GCC Regulatory Bodies" subtitle
- Each item: use the row card pattern
- Add a country flag emoji next to the institution abbreviation badge
- Badge color: use blue-light bg + blue text for the country code pill
- "Visit Website" link: style as a small blue text link with external link icon
- Group by country with subtle section dividers if possible

---

### 04. AI Financial Analyst (`/ai`)

Current: large empty space, 4 suggestion buttons, plain chat input at bottom.

Upgrade instructions:
- Remove the large empty gap — the suggestion buttons should sit closer to the icon
- Icon: larger, navy bg rounded square (60x60px) instead of the current light circle
- Title: Sora bold, larger (20px)
- Suggestion buttons: style as bordered pill cards with a small arrow icon on the right, 2-column grid
- Chat input: full-width, rounded pill shape, navy send button (not blue circle)
- Add a "Powered by VIFM AI" subtle badge below the input
- When a chat thread exists, show messages in standard chat bubble style: user = navy bg right-aligned, AI = white card left-aligned with VIFM logo

---

### 05. Portfolio (`/portfolio`)

Current: unknown — apply the same design system.

Upgrade instructions:
- Summary card at top: show total portfolio value in large Sora bold, daily change in green/red
- Holdings list: each row is a card with company logo placeholder, name, ticker, value, and % change
- Use green/red colored change indicators consistently
- Bottom: "Add Holding" button in navy, full-width, rounded

---

### 06. Company Profile (`/company/:id`)

Upgrade instructions:
- Hero section: company name (Sora bold large) + sector badge + country flag
- Key metrics in a 2x2 grid of metric cards (market cap, P/E ratio, ROE, revenue)
- Metric cards: white bg, muted label top, bold value bottom
- Tabs below: Overview / Financials / Comparisons / Reports
- Active tab: navy underline, bold text
- Charts: use a clean line chart with the brand blue (#5391D5) as the line color

---

### 07. Login / Register / Reset Password

Upgrade instructions:
- Full-screen white layout, no sidebar
- Top: أسهم logo centered, large
- Heading: Sora bold 24px
- Inputs: full-width, 48px height, 16px radius, 1px border, focus ring in blue
- Primary button: full-width, navy bg, white text, Sora 600, 48px height
- Secondary link: plain text, blue color
- Divider: "or continue with" with horizontal lines

---

### 08. Settings / Profile (`/settings`)

Upgrade instructions:
- Header: "Settings" title
- User card at top: avatar circle (large, navy bg) + name + email
- Grouped setting rows: each group has a section label, items are full-width rows with label + value/toggle + chevron
- Dividers between groups
- Destructive actions (logout, delete): red text

---

## Animation Guidelines

- **Page load:** staggered `fadeUp` animation on cards (0.05s delay increments)
- **Ticker cards:** `slideIn` from right on load
- **Card hover:** `translateY(-2px)` + shadow increase, 150ms ease
- **Toggle switch:** background color transition, 200ms ease
- **Live dot:** `pulse` opacity animation, 2s infinite
- **Nav active state:** instant color change (no transition needed)

Keep animations subtle. One well-orchestrated page load is better than scattered effects everywhere.

---

## What NOT to Change

- All routing and navigation logic
- All API calls and data-fetching hooks
- All Supabase integration
- All authentication logic
- The 7-tab bottom navigation structure
- The bilingual (Arabic/English) content where it exists
- The "My Screen / Explore" toggle behavior

---

## Implementation Order (Recommended)

1. Update `tailwind.config.ts` with new tokens (fonts, colors, border radius)
2. Create a global `design-tokens.css` with CSS custom properties
3. Implement `HomePage` component using `ashom-dashboard.html` as reference
4. Implement shared components: `Header`, `BottomNav`, `FeatureCard`, `TickerCard`, `SectionHeader`
5. Apply shared components to all remaining screens
6. Screen-by-screen upgrades: Analytics → Markets → AI → Portfolio → Company Profile → Auth screens → Settings

---

## Reference Files

| File | Purpose |
|---|---|
| `ashom-dashboard.html` | Approved Dashboard design prototype |
| `DESIGN_BRIEF.md` | This file — full design system and screen instructions |
| `VIFM Brand Kit.pdf` | Original brand assets (already in repo root) |

---

*Brief prepared by Aiman Sadeq — VIFM, April 2026*
