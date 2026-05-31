# AutoTallerManager — Design System

> **Version:** 1.0  
> **Date:** 2026-05-29  
> **Reference:** `docs/requirements/source-documents/dashboard-reference.jpeg` (Admin dashboard mockup)  
> **Scope:** Frontend UI guidelines for implementation

---

## Visual style summary based on the dashboard reference image

The reference depicts a **professional automotive workshop management** admin dashboard branded **“AUTO TALLER — GESTIÓN PROFESIONAL”**. The aesthetic is:

- **Modern dark mode** with high contrast and restrained color accents.
- **Automotive context** via subtle photographic backgrounds (workshop, lifts, tools) in header/footer areas — low opacity so content remains readable.
- **Data-first layout:** KPI metric cards in a dense grid, clear hierarchy, minimal chrome.
- **Operational tone:** Serious, efficient, suitable for all-day use in a workshop office.

The reference sidebar labels are in Spanish; the implemented UI should use **English labels** per project requirements while keeping the same structure and visual weight.

---

## Theme direction

| Aspect | Direction |
|--------|-----------|
| Mode | **Dark-first** (default). Light mode optional later. |
| Density | Comfortable — readable at arm’s length on desktop; not ultra-compact. |
| Corners | Medium radius (~8px on cards, ~9999px on search pill). |
| Elevation | Low — rely on background contrast and 1px borders, not heavy shadows. |
| Motion | Subtle transitions (150–200ms) on hover/focus; respect `prefers-reduced-motion`. |
| Brand | Red accent + wrench/car motif in logo area; workshop professionalism over consumer playfulness. |

---

## Dark theme guidelines

- **Page background:** Deep charcoal near `#121212`.
- **Surface / card:** Elevated dark grey near `#1e1e1e`.
- **Sidebar:** Slightly darker or same as page background; active item uses darker red tint.
- **Text primary:** White or near-white (`#ffffff` / `#f5f5f5`).
- **Text secondary:** Light grey (`#a0a0a0` or similar) for subtitles, footers, metadata.
- **Borders:** Subtle `1px` borders at ~10–15% white opacity.
- **Focus rings:** Visible accent outline (red or neutral) for keyboard users.
- **Photographic overlays:** Optional in top bar / page footer only; opacity ≤ 15% with dark scrim.

---

## Main colors

| Token | Suggested value | Usage |
|-------|-----------------|--------|
| `--color-bg-base` | `#121212` | App background |
| `--color-bg-surface` | `#1e1e1e` | Cards, panels, inputs |
| `--color-bg-sidebar` | `#161616` | Sidebar |
| `--color-border` | `rgba(255,255,255,0.12)` | Cards, inputs, dividers |
| `--color-text-primary` | `#ffffff` | Headings, values |
| `--color-text-secondary` | `#9ca3af` | Subtitles, footers |
| `--color-accent` | `#e53935` (vibrant red) | Brand, active nav, primary CTA |
| `--color-accent-muted` | `rgba(229,57,53,0.15)` | Active nav background |

### Semantic status colors

| Semantic | Color | Example use |
|----------|-------|-------------|
| Success / active | Muted green | Active users, completed orders |
| Info / in progress | Blue | Clients metric, orders in process |
| Warning / pending | Yellow / orange | Pending orders, pending payments |
| Danger / alert | Red | Low stock, errors, destructive actions |
| Staff / specialty | Purple | Mechanics metric |
| Neutral highlight | Teal | Vehicles serviced metric |

Map semantic colors to **seeded backend status IDs** (OrderStatus, InvoiceStatus, PaymentStatus) consistently across tables and badges.

---

## Primary / accent color usage

**Use red accent for:**

- Logo icon and “GESTIÓN PROFESIONAL” sub-brand line (reference uses red subtext).
- Active sidebar item: left vertical bar (3–4px) + tinted row background.
- Primary buttons (Save, Create, Confirm non-destructive).
- Notification badge dot/count.
- Links and focused form controls (optional).

**Do not overuse red for:**

- Body text, table zebra stripes, or every icon — semantic colors carry meaning on KPI cards.

**Destructive actions:** Use red button variant with confirmation modal; distinguish from primary “accent” when both are red (e.g. outline vs solid).

---

## Sidebar style

- **Width:** Fixed ~240–260px expanded; collapsible to icon-only (~64px) via “Collapse menu” control at bottom.
- **Logo block:** Wrench + car icon, “AUTO TALLER” (white), tagline in accent red.
- **Nav items:** Icon + label; vertical stack with comfortable padding.
- **Active state:** Dark red background fill, bright red left border, white label.
- **Inactive:** Grey icon/text; hover → slight surface lighten.
- **Expandable groups:** “Catalogs” shows chevron; submenu indented (reference implies dropdown).
- **Collapse control:** Bottom-aligned, chevron + “Collapse menu” label.

**Role variants:** Same chrome; **nav item set changes by role** (Admin full tree per reference; Receptionist/Mechanic/Client subsets per `frontend-requirements.md`).

---

## Topbar style

- **Height:** ~56–64px; full width of main content column.
- **Left:** Hamburger (mobile / collapsed sidebar) + **pill search** (“Search…” placeholder, magnifying glass icon).
- **Right cluster:**
  - Notifications bell with red numeric badge (UI-only until API exists).
  - Help icon (circle + question mark).
  - User block: avatar circle, display name, role subtitle (e.g. “Admin” / “Administrator”).
  - Optional **date display button** (rounded, border) — use only where backed by API (reports); dashboard global date is ⚠️ unconfirmed.
- **Background:** Dark surface; optional faint workshop photo with scrim.

---

## Dashboard layout

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │ Topbar (search, user, actions)               │
│          ├──────────────────────────────────────────────┤
│          │ Page title + subtitle                        │
│          │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  (row 1) │
│          │ │KPI │ │KPI │ │KPI │ │KPI │ │KPI │           │
│          │ └────┘ └────┘ └────┘ └────┘ └────┘  (row 2) │
│          │ │KPI │ │KPI │ │KPI │ │KPI │ │KPI │           │
│          │ [ future: charts, tables, quick actions ]    │
└──────────┴──────────────────────────────────────────────┘
```

- **Title:** Large, e.g. “ADMINISTRATIVE DASHBOARD”.
- **Subtitle:** Secondary grey, e.g. “General summary of workshop operations”.
- **KPI grid:** 5 columns × 2 rows on large desktop; 2–3 columns tablet; 1 column mobile.
- Bind card titles and values to **role dashboard DTO fields** when shapes are confirmed.

---

## Dashboard card style

Each **MetricCard** includes:

| Zone | Style |
|------|--------|
| Container | `#1e1e1e` background, ~8px radius, 1px border, padding 16–20px |
| Icon | Inside rounded square/circle with tinted background matching semantic color |
| Title | Medium weight, secondary or primary text |
| Value | Large bold (~28–32px) |
| Footer | Small secondary text; optional status dot, chevron, or trend (“↑ 12%”) |

**Interaction:** Optional chevron on card footer implies navigation to related list (e.g. active orders → service orders page).

---

## Table style

- **Container:** Same surface color as cards; rounded corners.
- **Header row:** Slightly darker background; uppercase or semibold small labels.
- **Rows:** Hover highlight; 1px divider between rows.
- **Actions column:** Icon buttons or overflow menu (View, Edit, Delete).
- **Status column:** `StatusBadge` component.
- **Empty:** Centered illustration + message + primary action (e.g. “Create first client”).
- **No pagination bar** (backend returns full lists) — optional client-side page size selector for UX.

---

## Form style

- **Layout:** Single column on mobile; two columns for wide forms (person, vehicle).
- **Labels:** Above inputs; required marker `*`.
- **Inputs:** Dark fill, subtle border, rounded ~6–8px; white text; placeholder grey.
- **Validation:** Inline error text below field in danger color; rely on API `message` when field-level codes unavailable.
- **Sections:** Group related fields (Identity, Contact, Vehicle, Entry inventory checklist).
- **Actions:** Footer bar with Cancel (ghost) + Save (primary accent).
- **Wizards:** Client registration and workshop intake may use stepped flow with progress indicator.

---

## Button style

| Variant | Appearance |
|---------|------------|
| Primary | Solid accent red, white text |
| Secondary | Outlined or grey fill |
| Ghost | Transparent, text only |
| Danger | Red outline or solid; always paired with confirm dialog |
| Disabled | Reduced opacity, no pointer |

**Sizes:** `sm` for tables, `md` default, `lg` for hero CTAs.  
**Icon buttons:** Square ~36px for toolbar/table actions.

---

## Modal style

- **Overlay:** Black ~60% opacity.
- **Panel:** Centered, max-width `sm`/`md`/`lg` by content; surface `#1e1e1e`, radius 8px.
- **Header:** Title + close (X).
- **Body:** Form or confirmation text.
- **Footer:** Right-aligned Cancel + primary action.
- **Destructive confirmations:** Explicit action name (“Void order”, “Refund payment”).

---

## Badge / status label style

- **Pill shape:** Small padding, rounded full, semibold 12px text.
- **Dot variant:** 6–8px circle in footer rows (reference KPI footers).
- **Mapping:** OrderStatus (Pending, InProgress, Completed, Cancelled, Voided), InvoiceStatus, PaymentStatus — colors aligned with semantic palette above.
- **Low stock / alert:** Red badge on inventory rows.

---

## Icon usage

- **Style:** Outline or simple filled icons (Lucide, Heroicons, or equivalent).
- **Nav:** One icon per sidebar item matching reference (dashboard, users, clipboard, wrench, etc.).
- **KPI cards:** Icon in tinted container matching card semantic color.
- **Consistency:** 20–24px inline; 16px in dense tables.

---

## Loading states

- **Initial page:** Skeleton placeholders matching card grid and table row height.
- **Buttons:** Spinner inside button; disable during mutation.
- **Search:** Subtle loading indicator in search field or results panel.
- **Avoid** full-screen blocking loader except for auth bootstrap.

---

## Empty states

- **Tone:** Neutral, helpful (“No service orders yet”).
- **Content:** Short title, one-line explanation, primary CTA where user can create data.
- **Illustration:** Optional simple line art; do not clash with dark theme.

---

## Error states

- **Inline:** Field and banner for 400 validation (`message` from API).
- **Page-level:** Card with error icon, message, Retry button for 500/network.
- **403:** Dedicated “Access denied” with link back to role home.
- **404:** “Resource not found” on invalid detail routes.
- **Auth expired:** Redirect to login with toast.

---

## Confirmation states

- Use modals for: delete, void order, cancel invoice, refund payment, reject approval.
- **Success:** Toast notification + invalidate queries + navigate or refresh list.
- **Partial success:** Not expected from API; treat as error unless documented.

---

## Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1280px) | Sidebar expanded; 5-column KPI grid |
| Tablet (768–1279px) | Collapsible sidebar; 2–3 KPI columns; tables horizontal scroll |
| Mobile (<768px) | Sidebar drawer over content; hamburger in topbar; stacked KPI cards; simplified tables (card list pattern optional) |

**Touch:** Minimum tap target 44px for nav and actions.

---

## Accessibility notes

- **Contrast:** Meet WCAG AA for text on dark backgrounds (especially grey secondary text).
- **Focus:** Visible focus ring on all interactive elements.
- **Keyboard:** Sidebar navigable by arrow keys; modals trap focus; Esc closes modal.
- **Screen readers:** `aria-current` on active nav; live region for toasts; table headers scoped.
- **Motion:** Honor `prefers-reduced-motion` (disable parallax/photo Ken Burns if any).
- **Forms:** Associate `<label>` with inputs; announce errors via `aria-invalid` + `aria-describedby`.
- **Color:** Do not rely on color alone for status — include text label in badges.
- **Language:** `lang="en"` on document; localized formats for dates/currency per locale decision.

---

## Implementation tokens (suggested)

Define in CSS variables or theme object (Tailwind / CSS-in-JS):

```css
:root {
  --color-bg-base: #121212;
  --color-bg-surface: #1e1e1e;
  --color-accent: #e53935;
  --radius-card: 8px;
  --radius-pill: 9999px;
  --font-sans: system-ui, "Segoe UI", sans-serif;
}
```

Component library choice is deferred to implementation plan; tokens above should be preserved regardless of library.

---

## Design open items

See `open-questions.md` → **Design doubts** for:

- Notification bell data source
- Dashboard date picker behavior
- Exact typography/font family (reference: generic sans-serif)
- Light theme (not in reference)

---

*Derived from dashboard reference image and api-contract UX notes. Last updated: 2026-05-29.*
