# UI/UX Design Guidelines — DS/01 · v1.0

> **Clean. Minimal. Bold.**
> A stripped-back design language that prioritizes content clarity and reduces cognitive load. Every element earns its place through function, not decoration.

| | |
|---|---|
| **Typefaces** | 2 |
| **Breakpoints** | 2 |
| **Max Width** | 1152px |
| **Base Size** | 16px |

---

## Table of Contents

1. [Principles](#1-principles)
2. [Typography](#2-typography)
3. [Color](#3-color)
4. [Spacing](#4-spacing)
5. [Components](#5-components)
6. [Data Formatting](#6-data-formatting)
7. [Do's and Don'ts](#7-dos-and-donts)
8. [File Structure & Tokens](#8-file-structure--tokens)

---

## 1. Principles

| # | Principle | Description |
|---|-----------|-------------|
| 01 | **Whitespace is a feature** | Generous spacing creates visual hierarchy and breathing room. Don't fight empty space — let it work for you. |
| 02 | **Large numbers tell the story** | Key metrics should be immediately scannable at a glance. If it's important, make it big and monospaced. |
| 03 | **Stack, don't sidebar** | Vertical flow respects natural reading patterns. Top navigation, not sidebars. Content stacks cleanly. |
| 04 | **Monochrome with purpose** | Color is reserved for meaning, never decoration. Emerald = positive. Red = error. Blue = info. That's it. |

---

## 2. Typography

### Font Stack

| Purpose | Font | Weights |
|---------|------|---------|
| Body, UI, Labels | DM Sans | 400, 500, 600, 700 |
| Numbers, Code, Labels | Space Mono | 400, 700 |

> **Rule:** Never introduce a third typeface. DM Sans for all prose and UI; Space Mono exclusively for numbers, code snippets, and uppercase label tags.

### Type Scale

| Element | Class | Size | Weight | Notes |
|---------|-------|------|--------|-------|
| Stat Number (Large) | `.stat-number` | 52–60px | 700 | Monospace, `tabular-nums`, tight tracking |
| Page Title | `.page-title` | 42–48px | 700 | `letter-spacing: -0.025em` |
| Stat Number (Medium) | `.stat-number-md` | 36–48px | 700 | Monospace, secondary metrics |
| Section Title / Eyebrow | `.section-title` | 10–12px | 700 | Uppercase, `letter-spacing: 0.15em`, muted color |
| Body | — | 16px | 400 | `line-height: 1.6` |
| Stat Labels | `.stat-label` | 16px | 400 | Placed above the value |
| Small / Captions | — | 13–14px | 400 | Muted color |

### Principles

- **Stat numbers** → `font-family: 'Space Mono'` + `font-variant-numeric: tabular-nums` to prevent layout shift when digits change.
- **Section titles** → ALL CAPS with `letter-spacing: 0.15em` and `color: --muted-foreground`.
- **Page titles** → Bold, tight tracking (`-0.025em`), never italic.
- Limit use of weight 600 and 700 to headings and key labels only. Overuse of bold flattens the hierarchy.

---

## 3. Color

### Base Palette — Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#fafafa` | Page background |
| `--foreground` | `#0a0a0a` | Primary text |
| `--muted` | `#f5f5f5` | Subtle backgrounds, cards |
| `--muted-foreground` | `#737373` | Secondary text, labels |
| `--border` | `#e5e5e5` | Dividers, table lines |

### Semantic Colors

Color carries meaning. Use these consistently and never for decoration.

| Color | Token Reference | Usage |
|-------|----------------|-------|
| Emerald | `text-emerald-600` | Positive values, active status |
| Red | `text-destructive` | Negative values, errors, overdue items |
| Blue | `badge-info` | Informational badges, phases |
| Neutral Gray | — | Inactive and default states |

### Badges

Small, pill-shaped status indicators. Three variants only.

```css
.badge-active   { background: #d1fae5; color: #065f46; }  /* Emerald */
.badge-inactive { background: #f5f5f5; color: #525252; }  /* Neutral */
.badge-info     { background: #dbeafe; color: #1e40af; }  /* Blue    */
```

**Usage:**
```html
<span class="badge badge-active">Active</span>
<span class="badge badge-inactive">Archived</span>
<span class="badge badge-info">Phase 2</span>
```

> **Rule:** Do not invent new badge colors. If a new state is needed, discuss whether it fits one of the three existing variants before extending the system.

---

## 4. Spacing

### Vertical Rhythm

Consistent spacing is what makes the product feel cohesive. Do not deviate from these values without a reason.

| Context | Tailwind Class | Value |
|---------|---------------|-------|
| Between major sections | `space-y-24` | 96px |
| Stats grid gap | `gap-16` | 64px |
| Section title → content | `mb-8` | 32px |
| Table row padding (vertical) | `py-5` | 20px |
| Page top/bottom padding | `py-16` | 64px |
| Container horizontal padding | `px-6` | 24px |

### Container

```
Max width:          max-w-6xl  →  1152px
Horizontal padding: px-6       →  24px each side
```

### Responsive Grid

```css
/* Stats grid — 3 columns on desktop, stacked on mobile */
grid-template-columns: repeat(1, 1fr);

@media (min-width: 768px) {
  grid-template-columns: repeat(3, 1fr);
}
```

---

## 5. Components

### Navigation

Top horizontal bar. Text links only. No icons, no dropdowns unless necessary.

```
[Logo / DS/01]     [Link]  [Link]  [Link]  [Link]
```

- **Current page:** `color: --foreground` + `font-weight: 500`
- **Other links:** `color: --muted-foreground` with `hover: --foreground`
- Sticky, with `backdrop-filter: blur(8px)` and a subtle bottom border

### Page Structure

```
┌─────────────────────────────────────────────┐
│  Eyebrow label (SECTION · v1.0)             │
│  Hero Title (large, tight tracking)         │
│  Description (muted, max 520px wide)        │
│  Meta stats (Space Mono, small)             │
├─────────────────────────────────────────────┤
│  Section Label (UPPERCASE MONO EYEBROW)     │
│                                             │
│  Stats Grid (3 columns)                     │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ LABEL      │ │ LABEL      │ │ LABEL    ││
│  │ $142K      │ │ 12         │ │ 3        ││
│  └────────────┘ └────────────┘ └──────────┘│
│                                             │
├─────────────────────────────────────────────┤
│  Section Label                              │
│  ──────────────────────────────────────     │
│  Table Row                                  │
│  ──────────────────────────────────────     │
│  Table Row                                  │
│  ──────────────────────────────────────     │
└─────────────────────────────────────────────┘
```

### Stats Block

Label above, value below. Always.

```html
<div>
  <p class="section-title">Total Revenue</p>
  <p class="stat-number">$142,000</p>
</div>
```

- 3-column grid on desktop (`md:grid-cols-3`), single column on mobile
- Use `color: --muted-foreground` for the label
- Stat numbers are monospace with `tabular-nums`
- Apply semantic color when the number carries meaning (green for active count, red for overdue)

### Data Tables

```html
<table class="data-table">
  <thead>
    <tr>
      <th>Project</th>
      <th>Status</th>
      <th style="text-align: right;">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Brand Refresh</td>
      <td><span class="badge badge-active">Active</span></td>
      <td style="text-align: right; font-family: 'Space Mono';">$24,000</td>
    </tr>
  </tbody>
</table>
```

**Table rules:**
- Headers: uppercase, 10–11px, `letter-spacing: 0.1em`, `color: --muted-foreground`
- Row padding: `py-5` (20px vertical)
- Borders: subtle `1px solid --border` on bottom of each row; last row has no border
- Text: left-aligned; monetary values **always** right-aligned in monospace
- No zebra striping, no background fills on rows

### Empty States

```html
<p style="color: var(--muted-foreground); padding: 32px 0;">
  No items match your filter
</p>
```

Simple muted text. Centered if inside a card, left-aligned if inline in a section. No illustrations or icons.

---

## 6. Data Formatting

### Currency

```typescript
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount);

// → $50,000
```

### Dates

```typescript
// Short form (default)
new Date(date).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
});
// → Jan 9

// Full form (when year context is needed)
new Date(date).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
// → Jan 9, 2026
```

### Numbers

```typescript
// Comma-separated
(1428).toLocaleString();
// → 1,428

// Always apply to stat numbers in JSX/HTML:
// font-variant-numeric: tabular-nums
// Prevents layout shift when values update
```

> **Rule:** Every number that appears on screen must be formatted. Raw floats like `0.30000000000000004` or `7.700000000000001` must never reach the UI. Use `Math.round()`, `.toFixed(n)`, or `Intl.NumberFormat`.

---

## 7. Do's and Don'ts

### ✅ Do

- Use large numbers for key metrics — make them unmissable
- Maintain consistent vertical spacing from the scale above
- Right-align all monetary values in tables
- Use `Space Mono` + `tabular-nums` for all numbers and codes
- Keep tables simple with minimal borders and generous row padding
- Use color sparingly — only when it carries semantic meaning
- Place stat labels **above** the value, never below
- Use sticky top navigation for wayfinding

### ❌ Don't

- Add decorative drop shadows, gradients, or icon clutter
- Use multiple colors without semantic purpose
- Crowd content with spacing tighter than the scale defines
- Center-align data inside tables
- Use sidebars or complex nested navigation
- Add hover animations without a clear functional purpose
- Mix typefaces beyond DM Sans and Space Mono
- Use `font-weight: 600` or `700` outside of headings and key labels

---

## 8. File Structure & Tokens

### Project Structure

```
src/
├── layouts/
│   └── Layout.astro       ← Base layout with sticky nav
├── pages/
│   ├── index.astro        ← Dashboard / Overview
│   ├── projects.astro
│   ├── bills.astro
│   └── budget.astro
└── styles/
    └── global.css         ← All design tokens live here
```

### CSS Custom Properties

All design tokens are defined as CSS custom properties in `global.css`. Never hardcode hex values in component files — always reference a token.

```css
/* global.css */
:root {
  --radius:            0.5rem;
  --background:        #fafafa;
  --foreground:        #0a0a0a;
  --muted:             #f5f5f5;
  --muted-foreground:  #737373;
  --border:            #e5e5e5;
}
```

### Referencing Tokens via Tailwind

```html
<!-- Secondary text -->
<p class="text-muted-foreground">Invoice #1042</p>

<!-- Subtle background -->
<div class="bg-muted">...</div>

<!-- Divider / border -->
<div class="border-border">...</div>
```

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stats stack to single column; tables scroll horizontally |
| Desktop | `≥ 768px` | 3-column stats grid; full table layout |

Only two breakpoints. Resist the urge to add more.

---

*DS/01 · Design System v1.0 — DM Sans + Space Mono · max-w-6xl*
