# PM App - Tasks & Progress Tracker

> Project Management & Budget Tracking Application  
> Built with Astro, PocketBase, React, Tailwind CSS v4

---

## ✅ Completed Features

### Core Infrastructure
- [x] Astro framework setup with SSR (`@astrojs/node`)
- [x] PocketBase integration with typed client
- [x] React integration for interactive components
- [x] Tailwind CSS v4 with custom theme
- [x] Docker & Fly.io deployment configuration
- [x] Caddy reverse proxy setup

### Authentication
- [x] Login page with form validation
- [x] Session-based auth with cookies (`pb_auth`)
- [x] Logout functionality
- [x] Protected routes middleware
- [x] Auth redirect for unauthenticated users

### Internationalization (i18n)
- [x] English (en) support
- [x] Arabic (ar) support with RTL layout
- [x] Language switcher component
- [x] Locale-based routing (`/[locale]/...`)
- [x] Currency formatting per locale
- [x] Date formatting per locale

### Dashboard (Home)
- [x] Budget summary (Cash, Obligated, Remaining)
- [x] Cost summary (secondary stats)
- [x] Activity stats (Payments, Obligations, Bills, Projects)
- [x] Active projects table (top 5)
- [x] Upcoming bills table (top 5)
- [x] Recent payments table (top 5)
- [x] Current year filtering

### Projects Page
- [x] Projects listing table
- [x] Filter by year
- [x] Filter by phase
- [x] Filter by status (active/inactive)
- [x] Stats display (count, active, total value)
- [x] Phase badges with colors
- [x] Timeline display (start/end dates)
- [x] Status indicator dots

### Bills Page
- [x] Bills listing table
- [x] Total amount stats
- [x] Upcoming vs overdue count
- [x] Due date highlighting (overdue in red)
- [x] Notes display

### Budget Page
- [x] Year filter dropdown
- [x] Budget summary stats (Cash/Cost with obligations & remaining)
- [x] Budget items cards with detailed breakdown
- [x] Payments table with budget/project references
- [x] Transfers table (from/to budgets)
- [x] Obligations table with full details
- [x] Per-budget obligation and payment calculations

### UI/UX
- [x] Clean, minimal design system
- [x] Custom typography (Rubik, Space Mono, Arshid for numbers)
- [x] Consistent spacing and layout patterns
- [x] Data tables with generous padding
- [x] Badge components (active, inactive, info)
- [x] Status dot indicators
- [x] Empty states for tables
- [x] Dark mode CSS variables (not toggled yet)
- [x] Clickable table rows linking to detail pages

### Reusable Components
- [x] `PageHeader.astro` - Page header with title, subtitle, back link
- [x] `StatsGrid.astro` - Responsive stats grid (2/3/4 columns)
- [x] `StatItem.astro` - Stat display with label, value, variants
- [x] `DetailSection.astro` - Section wrapper with title
- [x] `DetailCard.astro` - Card component for grouped content
- [x] `EmptyState.astro` - Empty state message component

### Detail Pages
- [x] Project detail page (`/projects/[id]`)
  - Project overview with name, ref, phase, status
  - Timeline info (start/end dates, duration)
  - Assignees display
  - Financial summary (obligated, paid, remaining)
  - Linked obligations table
  - Linked payments table
- [x] Bill detail page (`/bills/[id]`)
  - Bill header with name, ref, budget reference
  - Overview stats (amount, due date, remaining)
  - Notes display
  - Financial summary
  - Linked obligations table
  - Payment history table
- [x] Budget detail page (`/budget/[id]`)
  - Budget header with name, ref, year
  - Allocation stats (cash, cost, remaining)
  - Financial summary with transfers
  - Obligations table
  - Payments table
  - Transfers table (in/out indicators)

### Data Types
- [x] User type
- [x] Budget type
- [x] BudgetItem type
- [x] Transfer type
- [x] Obligation type
- [x] Phase type
- [x] Bill type
- [x] Project type
- [x] Payment type
- [x] TypedPocketBase interface

---

## 📋 To Do - High Priority

### CRUD Operations
- [ ] **Projects**
  - [ ] Create new project form
  - [ ] Edit project form
  - [ ] Delete project with confirmation
  - [x] Project detail page (`/projects/[id]`)

- [ ] **Bills**
  - [ ] Create new bill form
  - [ ] Edit bill form
  - [ ] Delete bill with confirmation
  - [x] Bill detail page (`/bills/[id]`)

- [ ] **Budget Items**
  - [ ] Create new budget item form
  - [ ] Edit budget item form
  - [ ] Delete budget item with confirmation

- [ ] **Payments**
  - [ ] Create new payment form
  - [ ] Edit payment form
  - [ ] Delete payment with confirmation

- [ ] **Obligations**
  - [ ] Create new obligation form
  - [ ] Edit obligation form
  - [ ] Delete obligation with confirmation

- [ ] **Transfers**
  - [ ] Create new transfer form
  - [ ] Edit transfer form
  - [ ] Delete transfer with confirmation

### API Routes
- [ ] POST `/api/projects` - Create project
- [ ] PUT `/api/projects/[id]` - Update project
- [ ] DELETE `/api/projects/[id]` - Delete project
- [ ] POST `/api/bills` - Create bill
- [ ] PUT `/api/bills/[id]` - Update bill
- [ ] DELETE `/api/bills/[id]` - Delete bill
- [ ] POST `/api/budget-items` - Create budget item
- [ ] PUT `/api/budget-items/[id]` - Update budget item
- [ ] DELETE `/api/budget-items/[id]` - Delete budget item
- [ ] POST `/api/payments` - Create payment
- [ ] PUT `/api/payments/[id]` - Update payment
- [ ] DELETE `/api/payments/[id]` - Delete payment
- [ ] POST `/api/obligations` - Create obligation
- [ ] PUT `/api/obligations/[id]` - Update obligation
- [ ] DELETE `/api/obligations/[id]` - Delete obligation
- [ ] POST `/api/transfers` - Create transfer
- [ ] PUT `/api/transfers/[id]` - Update transfer
- [ ] DELETE `/api/transfers/[id]` - Delete transfer

---

## 📋 To Do - Medium Priority

### Detail Pages
- [x] Project detail page with full info
- [x] Bill detail page with payment history
- [x] Budget detail page per budget item

### File Management
- [ ] File upload component
- [ ] Display attached files on projects
- [ ] Display attached files on bills
- [ ] Display attached files on obligations
- [ ] Display attached files on payments
- [ ] Display attached files on transfers
- [ ] File download functionality

### Search & Filters
- [ ] Global search across entities
- [ ] Projects search by name/ref
- [ ] Bills search by name/ref
- [ ] Advanced date range filters

### Phase Management
- [ ] List phases (admin)
- [ ] Create/edit/delete phases
- [ ] Reorder phases

---

## 📋 To Do - Low Priority

### Dark Mode
- [ ] Dark mode toggle button in header
- [ ] Persist dark mode preference
- [ ] System preference detection

### User Experience
- [ ] Loading states/skeletons
- [ ] Toast notifications for actions
- [ ] Confirm dialogs for destructive actions
- [ ] Keyboard shortcuts

### Reports & Exports
- [ ] Export projects to CSV/Excel
- [ ] Export bills to CSV/Excel
- [ ] Export budget report to PDF
- [ ] Print-friendly views

### User Management
- [ ] User profile page
- [ ] Change password
- [ ] User list (admin only)
- [ ] Invite new users

### Team Features
- [ ] Assignee management on projects
- [ ] User avatars
- [ ] Activity log/history

### Mobile Improvements
- [ ] Responsive navigation (hamburger menu)
- [ ] Touch-friendly table interactions
- [ ] Swipe actions on mobile

### Performance
- [ ] Pagination for large tables
- [ ] Virtual scrolling for long lists

### Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Developer setup guide

---

## 🗄️ Database Schema (PocketBase)

### Collections
| Collection | Description |
|------------|-------------|
| `users` | Built-in PocketBase users |
| `budgets` | Budget definitions (ref, name, description) |
| `budget_items` | Yearly budget allocations (budget, year, cash, cost) |
| `projects` | Project records with phases and assignees |
| `phases` | Project phase definitions with colors |
| `bills` | Recurring bills with due dates |
| `obligations` | Financial commitments against budgets |
| `payments` | Actual payments made |
| `transfers` | Budget transfers between allocations |

---

## 📁 Project Structure

```
pm-app/
├── db/                     # PocketBase configuration
│   ├── pb_migrations/      # Database migrations
│   └── Dockerfile          # DB container
├── src/
│   ├── client.ts           # PocketBase client
│   ├── types.ts            # TypeScript interfaces
│   ├── middleware.ts       # Auth & i18n middleware
│   ├── components/
│   │   ├── ui/             # React UI components (needs restoration)
│   │   ├── PageHeader.astro
│   │   ├── StatsGrid.astro
│   │   ├── StatItem.astro
│   │   ├── DetailSection.astro
│   │   ├── DetailCard.astro
│   │   ├── EmptyState.astro
│   │   └── LanguageSwitcher.astro
│   ├── i18n/
│   │   ├── ui.ts           # Translation strings
│   │   └── utils.ts        # i18n utilities
│   ├── layouts/
│   │   ├── Layout.astro    # Main layout with nav
│   │   └── Auth.astro      # Auth pages layout
│   ├── lib/
│   │   ├── isAuth.ts       # Auth helper
│   │   └── utils.ts        # General utilities
│   ├── pages/
│   │   ├── [locale]/       # Localized pages
│   │   │   ├── index.astro # Dashboard
│   │   │   ├── projects/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   ├── bills/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   ├── budget/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   ├── login.astro
│   │   │   └── admin.astro
│   │   └── api/            # API endpoints
│   └── styles/
│       └── global.css      # Tailwind & custom styles
├── public/
│   └── fonts/              # Custom fonts
├── astro.config.mjs
├── package.json
├── Dockerfile
├── docker-compose.yml
├── Caddyfile
└── fly.toml
```

---

## 🚨 Known Issues

1. **UI Components Deleted** - The `src/components/ui/` React components show as deleted in git status and need to be restored or recreated if needed for forms.

2. **Admin Page** - Currently just links to external PocketBase admin; consider building internal admin.

3. **No CRUD** - All data management currently requires direct PocketBase admin access.

---

## 📝 Notes

- App uses Bun as the package manager
- PocketBase is hosted separately on Fly.io (`pm-db.fly.dev`)
- Astro runs in SSR mode with Node adapter
- Uses custom Arabic number font (Arshid) for numeric displays

---

*Last updated: January 12, 2026 - Detail pages completed*
