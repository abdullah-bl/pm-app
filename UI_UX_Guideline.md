# UI/UX Guidelines

## Design Philosophy

**Clean. Minimal. Bold.**

This application follows a stripped-back aesthetic that prioritizes content clarity and reduces cognitive load. Every element earns its place through function, not decoration.

### Core Principles

1. **Whitespace is a feature** — Generous spacing creates visual hierarchy and breathing room
2. **Large numbers tell the story** — Key metrics are immediately scannable
3. **Stack, don't sidebar** — Vertical flow respects natural reading patterns
4. **Monochrome with purpose** — Color is reserved for meaning, not decoration

---

## Typography

### Font Stack

| Purpose | Font | Weight |
|---------|------|--------|
| Body | DM Sans | 400, 500, 600, 700 |
| Numbers/Code | Space Mono | 400, 700 |

### Scale

| Element | Class | Size |
|---------|-------|------|
| Stat Numbers | `.stat-number` | 48–60px (text-5xl / text-6xl) |
| Stat Numbers (Secondary) | `.stat-number-md` | 36–48px (text-4xl / text-5xl) |
| Page Title | `.page-title` | 36–48px (text-4xl / text-5xl) |
| Section Title | `.section-title` | 14px (text-sm) uppercase |
| Body | default | 16px (text-base) |
| Stat Labels | `.stat-label` | 16px (text-base) |
| Labels | `.label-text` | 16px (text-base) |

### Principles

- **Stat numbers** use monospace (`font-mono`) with `tabular-nums` for aligned digits
- **Section titles** are uppercase with wide letter-spacing (`tracking-widest`)
- **Page titles** are bold with tight tracking (`tracking-tight`)

---

## Color Palette

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | #fafafa | Page background |
| `--foreground` | #0a0a0a | Primary text |
| `--muted` | #f5f5f5 | Subtle backgrounds |
| `--muted-foreground` | #737373 | Secondary text |
| `--border` | #e5e5e5 | Dividers, table lines |

### Semantic Colors

| Color | Usage |
|-------|-------|
| Emerald (`text-emerald-600`) | Positive values, active status |
| Red (`text-destructive`) | Negative values, overdue, errors |
| Blue (`badge-info`) | Informational badges (phases) |
| Neutral | Inactive/default states |

### Badge Variants

```css
.badge-active   → bg-emerald-100 text-emerald-800
.badge-inactive → bg-neutral-100 text-neutral-600
.badge-info     → bg-blue-100 text-blue-800
```

---

## Spacing

### Vertical Rhythm

| Context | Spacing |
|---------|---------|
| Between major sections | `space-y-24` (96px) — consistent across all pages |
| Between stats grid items | `gap-16` (64px) |
| Section title to content | `mb-8` (32px) |
| Table row padding | `py-5` (20px) |
| Page padding (top) | `py-16` (64px) |

### Container

- Max width: `max-w-6xl` (1152px)
- Horizontal padding: `px-6` (24px)

---

## Layout Patterns

### Navigation

Top horizontal navigation, not sidebar. Simple text links.

```
[Logo]     [Link]  [Link]  [Link]  [Link]
```

- Current page: `text-foreground`
- Other links: `text-muted-foreground` with hover state

### Page Structure

```
┌─────────────────────────────────────┐
│  Header (Title + Description)       │
├─────────────────────────────────────┤
│                                     │
│  Stats Grid (3 columns)             │
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ 12  │  │ 5   │  │$50K │         │
│  └─────┘  └─────┘  └─────┘         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Section Title                      │
│  ─────────────────────────────────  │
│  Table Row                          │
│  ─────────────────────────────────  │
│  Table Row                          │
│  ─────────────────────────────────  │
│                                     │
└─────────────────────────────────────┘
```

### Stats Block

```html
<div>
  <p class="section-title">Label</p>
  <p class="stat-number">Value</p>
</div>
```

- Label above, value below
- 3-column grid on desktop, stack on mobile
- Numbers should be formatted (currency, commas)

---

## Components

### Tables

```html
<table class="data-table">
  <thead>
    <tr>
      <th>Column</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Value</td>
    </tr>
  </tbody>
</table>
```

**Table styling:**
- Headers: uppercase, small, muted, wide tracking
- Rows: generous vertical padding, subtle bottom border
- Last row: no bottom border
- Alignment: numbers right-aligned, text left-aligned

### Badges

Small, pill-shaped status indicators.

```html
<span class="badge badge-active">Active</span>
<span class="badge badge-inactive">Inactive</span>
<span class="badge badge-info">Phase Name</span>
```

### Empty States

Simple, muted text message.

```html
<p class="text-muted-foreground py-8">No items found</p>
```

---

## Data Formatting

### Currency

```typescript
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount);

// Output: $50,000
```

### Dates

```typescript
new Date(date).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric", // optional, for full dates
});

// Output: Jan 9, 2026
```

### Numbers

- Use `.mono` class for tabular alignment
- Use `tabular-nums` for consistent digit width
- Format with `toLocaleString()` for comma separators

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile (<768px) | Stats stack vertically, single column tables scroll horizontally |
| Desktop (≥768px) | 3-column stats grid, full table width |

### Grid Classes

```css
grid-cols-1 md:grid-cols-3  /* Stats grid */
```

---

## Do's and Don'ts

### Do

- ✓ Use large numbers for key metrics
- ✓ Maintain consistent vertical spacing
- ✓ Right-align monetary values
- ✓ Use monospace for numbers and codes
- ✓ Keep tables simple with minimal borders
- ✓ Use color sparingly and with meaning

### Don't

- ✗ Add decorative elements (shadows, gradients, icons)
- ✗ Use multiple colors without semantic meaning
- ✗ Crowd content with tight spacing
- ✗ Center-align data tables
- ✗ Use sidebars or complex navigation
- ✗ Add hover animations without purpose

---

## File Structure

```
src/
├── layouts/
│   └── Layout.astro      # Base layout with nav
├── pages/
│   ├── index.astro       # Dashboard/Overview
│   ├── projects.astro
│   ├── bills.astro
│   └── budget.astro
└── styles/
    └── global.css        # Design tokens & utilities
```

---

## CSS Custom Properties

All design tokens are defined as CSS custom properties in `global.css`:

```css
:root {
  --radius: 0.5rem;
  --background: #fafafa;
  --foreground: #0a0a0a;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --border: #e5e5e5;
  /* ... */
}
```

Use Tailwind's `color-*` utilities to reference these tokens:

```html
<p class="text-muted-foreground">Secondary text</p>
<div class="bg-muted">Subtle background</div>
<div class="border-border">Border color</div>
```
