# AutoTallerManager — Frontend Implementation Plan

> **Version:** 1.0  
> **Date:** 2026-05-29  
> **Rule:** Implement **one phase per iteration**. Do not build the full frontend in a single pass.

**References:**

- `docs/api-contract.md` — endpoints and types
- `docs/requirements/frontend-requirements.md` — pages and routes
- `docs/requirements/design-system.md` — UI tokens and components
- `docs/requirements/open-questions.md` — blockers and placeholders

---

## Recommended frontend architecture

| Layer | Responsibility |
|-------|----------------|
| **UI (pages + components)** | Role layouts, forms, tables, dashboards |
| **Hooks** | Auth session, React Query wrappers, form state |
| **API services** | Thin modules per backend domain (`auth.api.ts`, etc.) |
| **HTTP client** | Base URL, JSON, JWT attach, refresh on 401, error parsing |
| **Types** | TypeScript interfaces aligned with DTOs |
| **Routing** | Public routes + role-prefixed protected areas |

**Suggested stack** (aligned with api-contract CORS notes):

- **React 18+** with **Vite**
- **TypeScript**
- **React Router** for SPA routing
- **TanStack Query** for server state (recommended in api-contract §14)
- **CSS:** Tailwind CSS or CSS modules with design tokens from `design-system.md`
- **Forms:** React Hook Form + Zod (client-side rules mirroring backend where documented)

No backend code changes in frontend phases.

---

## Recommended folder structure

```
AutoTallerManager-Frontend/
├── public/
├── src/
│   ├── app/                    # App root, providers, router
│   ├── api/
│   │   ├── httpClient.ts
│   │   ├── auth.api.ts
│   │   ├── account.api.ts
│   │   └── ...                 # One file per api-contract module
│   ├── types/                  # DTOs and ApiError
│   ├── hooks/                  # useAuth, useCatalogs, domain hooks
│   ├── features/               # Feature folders (optional grouping)
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── reception/
│   │   ├── mechanic/
│   │   └── client/
│   ├── components/
│   │   ├── layout/             # AppShell, Sidebar, TopBar
│   │   ├── ui/                 # Button, Badge, Modal, Table, MetricCard
│   │   └── domain/             # ServiceOrderDetail, RecordPaymentForm, ...
│   ├── pages/                  # Route-level page components
│   ├── routes/                 # Route config + guards
│   ├── styles/                 # globals, tokens
│   └── utils/                  # dates, currency, role helpers
├── docs/                       # Requirements (existing)
├── .env.example
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Routing strategy

1. **Public routes:** `/login`, `/register` — no layout shell.
2. **Protected wrapper:** Requires valid access token; loads `GET /api/account/me` optional for profile sync.
3. **Role prefixes:** `/admin/*`, `/reception/*`, `/mechanic/*`, `/client/*` per `frontend-requirements.md`.
4. **Shared account:** `/account/profile`, `/account/change-password` inside protected wrapper.
5. **Default redirect:** After login, map primary role to dashboard route.
6. **403 route:** `/unauthorized` for wrong role.
7. **Placeholders:** Routes for Settings, Work history, notifications — static “Pending backend confirmation” page component.

Use **lazy loading** (`React.lazy`) per role module from Phase 3 onward to keep initial bundle small.

---

## Authentication strategy

1. **Login:** `POST /api/auth/login` → store `accessToken`, `refreshToken`, expiry timestamps, `user.roles`.
2. **Storage:** `sessionStorage` or `memory + refresh` (document choice in Phase 2); never log tokens.
3. **Interceptor:** Attach `Authorization: Bearer {accessToken}` (confirm prefix in open-questions before production).
4. **Refresh:** On 401, single-flight `POST /api/auth/refresh`; retry original request; logout on failure.
5. **Logout:** `POST /api/auth/logout` + clear storage + redirect `/login`.
6. **Register:** Public catalog + `POST /api/auth/register-client` → auto-login with returned tokens.

---

## Role-based access strategy

1. **Route guard:** `RequireRole(['Admin'])` etc. on route definitions.
2. **Nav filter:** Sidebar items from role → page map in `frontend-requirements.md`.
3. **Action guards:** Hide buttons for forbidden actions (void, refund, adjust-stock).
4. **Never skip API errors:** 403 from API shows access denied even if UI hid action.

**Multi-role:** Blocked on product decision — Phase 2 uses first role in JWT array until `open-questions.md` resolved.

---

## API integration strategy

1. One **api service file** per bounded context in api-contract §11.
2. **No services** for open-question endpoints.
3. **React Query keys:** `['admin','dashboard']`, `['service-order', id]`, etc.
4. **Invalidate** after mutations per api-contract §14 (intake → orders + dashboard; payment → invoice + summary).
5. **Errors:** Parse `ApiError` on 4xx/5xx; generic message on 500.
6. **Base URL:** `import.meta.env.VITE_API_BASE_URL` default `http://localhost:5077`.

---

## TypeScript types strategy

1. Copy confirmed types from api-contract §10 into `src/types/`.
2. Extend types when Swagger or backend confirms remaining DTOs (track in open-questions).
3. **Do not invent** optional fields not in contract.
4. Consider future OpenAPI codegen script — manual maintenance until generator exists.

---

## UI component strategy

1. **Primitives first** (Phase 1–2): Button, Input, Badge, Card, Modal, Table shell, Skeleton.
2. **Layout** (Phase 3): AppShell, Sidebar, TopBar, MetricCard.
3. **Domain components** (Phases 4–7): Forms and panels per module.
4. Follow `design-system.md` tokens; English UI copy.

---

## Layout strategy

- Single **AppShell** for all authenticated roles.
- Sidebar content driven by role config JSON/TS map.
- Topbar: search dispatches to role-appropriate search route (Phase 5+).
- Breadcrumbs on detail pages.

---

## Forms strategy

- React Hook Form + Zod schemas from api-contract validation tables.
- Load catalogs before render (`public-registration`, `workshop`).
- Submit → mutation → toast → invalidate queries.
- No field-level server errors until backend provides them (show `message` banner).

---

## Tables, filters and pagination strategy

- **No server pagination** — fetch full list, client-side filter/sort.
- Debounced search via `/api/search/*?term=`.
- Virtualize long lists if performance requires (Phase 8).
- Status filters use seeded IDs from api-contract.

---

## Error / loading / empty states strategy

- React Query `isLoading`, `isError`, `isFetching`.
- Skeletons for dashboard and tables.
- `EmptyState` component with CTA.
- `ConfirmDialog` for destructive flows.
- Global toast for mutation success/failure.

---

# Development phases

---

## Phase 1 — Base project setup

### Objective

Bootstrap the SPA toolchain, HTTP foundation, design tokens, and primitive UI components without business pages.

### Scope

- Vite + React + TypeScript project
- ESLint/Prettier baseline
- Environment variable for API base URL
- Global styles / Tailwind + CSS variables from design system
- Primitive UI components
- Folder structure skeleton

### Files/folders likely to be created

```
package.json, vite.config.ts, tsconfig.json, index.html
src/main.tsx, src/app/App.tsx
src/styles/tokens.css, src/styles/globals.css
src/components/ui/Button.tsx, Input.tsx, Card.tsx, Badge.tsx, Modal.tsx, Skeleton.tsx
src/api/httpClient.ts
src/types/common.types.ts (ApiError)
.env.example
```

### Requirements used

- `api-contract.md` §4 (integration assumptions)
- `design-system.md` (tokens, primitives)

### Backend endpoints needed

None (optional health check manual only).

### Open questions that may block the phase

None blocking (Bearer prefix and dev URL confirmed in `api-contract.md` §4).

### Acceptance criteria

- [ ] `npm run dev` starts Vite on port compatible with CORS (`5173`)
- [ ] Design tokens applied to sample page proving dark theme
- [ ] `httpClient` can perform unauthenticated `GET` to a public endpoint when backend is running
- [ ] Primitive components render per design-system variants

### What must NOT be done in this phase

- No auth flows, no role routes, no domain pages
- No API services beyond http client stub
- No fake/mock business data layers

---

## Phase 2 — Authentication and role-based layout

### Objective

Implement login, logout, refresh, client registration, token storage, and route guards with minimal shell (no full sidebar module pages).

### Scope

- Auth API + types (`AuthResponseDto`, etc.)
- `useAuth` hook and `AuthProvider`
- Pages: Login, Client registration
- Protected route wrapper + role guard
- Post-login redirect by role
- Placeholder home per role (empty dashboard stub)
- Account routes stub optional

### Files/folders likely to be created

```
src/api/auth.api.ts, account.api.ts, catalogs.api.ts
src/types/auth.types.ts, account.types.ts, catalogs.types.ts
src/hooks/useAuth.ts
src/features/auth/LoginPage.tsx, RegisterClientPage.tsx
src/routes/ProtectedRoute.tsx, RequireRole.tsx, router.tsx
src/utils/roles.ts
```

### Requirements used

- `frontend-requirements.md` — Shared pages, roles, suggested public routes
- `api-contract.md` §5, §9 Auth, Account, Catalogs public

### Backend endpoints needed

- `POST /api/auth/login`, `/refresh`, `/logout`
- `POST /api/auth/register-client`
- `GET /api/catalogs/public-registration`
- `GET /api/account/me` (optional on boot)

### Open questions that may block the phase

- **Multi-role navigation** — use role picker or priority fallback per `open-questions.md` (Frontend decision)

### Acceptance criteria

- [ ] User can login with dev admin credentials from api-contract
- [ ] Invalid credentials show API error message
- [ ] Refresh rotates tokens without user action (simulate 401 or short expiry test)
- [ ] Logout clears session and blocks protected routes
- [ ] Client registration completes and lands on client area
- [ ] User with wrong role cannot access another role’s prefix (403 page)

### What must NOT be done in this phase

- No full AppShell sidebar catalog
- No dashboard KPI API binding
- No CRUD modules
- No mock auth bypass in production paths

---

## Phase 3 — Main layout and dashboards

### Objective

Deliver AppShell (sidebar, topbar), role navigation, and dashboard pages wired to role dashboard endpoints.

### Scope

- Layout components per design-system
- Sidebar nav config per role (Admin nav matches reference structure in English)
- Dashboard pages for Admin, Receptionist, Mechanic, Client
- MetricCard grid bound to dashboard DTOs **as returned by API** (flexible mapping until DTO documented)
- Collapse sidebar behavior
- Placeholder for notifications (no API)
- Do not implement dashboard date filter unless backend confirms

### Files/folders likely to be created

```
src/components/layout/AppShell.tsx, Sidebar.tsx, TopBar.tsx, MetricCard.tsx
src/config/navigation/admin.nav.ts, reception.nav.ts, mechanic.nav.ts, client.nav.ts
src/api/dashboards.api.ts
src/pages/admin/AdminDashboardPage.tsx
src/pages/reception/ReceptionDashboardPage.tsx
src/pages/mechanic/MechanicDashboardPage.tsx
src/pages/client/ClientDashboardPage.tsx
src/pages/shared/PendingConfirmationPage.tsx
```

### Requirements used

- `design-system.md` — full layout, dashboard cards
- `frontend-requirements.md` — dashboards, routes

### Backend endpoints needed

- `GET /api/admin/dashboard`
- `GET /api/receptionist/dashboard`
- `GET /api/mechanic/dashboard`
- `GET /api/client/dashboard`

### Open questions that may block the phase

- **Notifications** — hide bell or static disabled (Deferred)
- **Dashboard date filter** — omit (not in API)

### Acceptance criteria

- [ ] Each role sees correct sidebar items and land on correct dashboard
- [ ] Admin dashboard shows KPI cards styled per design-system
- [ ] Loading skeleton and error state on dashboard fetch failure
- [ ] Sidebar collapse works on desktop
- [ ] Responsive drawer sidebar on mobile
- [ ] Settings nav item routes to Pending confirmation page (Admin)

### What must NOT be done in this phase

- No CRUD list pages beyond dashboard
- No search implementation
- No invoice/order workflows
- No fake dashboard numbers

---

## Phase 4 — Admin module

### Objective

Implement Admin pages for users, staff, roles, catalogs, clients, vehicles, service orders, mechanics, inventory, purchases, invoicing, payments, reports, and audit.

### Scope

- All Admin routes under `/admin/*` with real API integration
- Generic catalog CRUD template
- Service order list + detail + workflow actions (void admin-only)
- Reports with `from`/`to` date params
- Settings remains placeholder

### Files/folders likely to be created

```
src/api/users.api.ts, staff.api.ts, persons.api.ts, vehicles.api.ts, ...
src/features/admin/** (pages per frontend-requirements)
src/components/domain/ServiceOrderDetailPanel.tsx, CatalogCrudPage.tsx, ...
src/pages/admin/* (17 route targets; Settings = placeholder)
```

### Requirements used

- `frontend-requirements.md` — Admin pages, endpoints, restrictions
- `role-functions-endpoints-matrix.md` — Admin sections 1.1–1.15

### Backend endpoints needed

All Admin endpoints listed in `frontend-requirements.md` Admin tables (users, staff, roles, catalogs, clients, vehicles, service-orders, inventory, invoices, payments, reports, audits).

### Open questions that may block the phase

- **Admin Settings** — placeholder (Deferred)
- **CRUD types** — copy from `Application/Features/*/Dtos` per `api-contract.md` §10 index

### Acceptance criteria

- [ ] Admin can complete: create staff → create client/vehicle → intake order → assign mechanic → generate/issue invoice → record payment
- [ ] Admin-only actions (void, cancel invoice, refund, adjust stock) visible and working
- [ ] Catalog CRUD works for at least two catalog types (e.g. service-types, part-categories)
- [ ] Reports load with date range query params
- [ ] Audit views load recent and by-entity queries
- [ ] 403/404/409 errors display user-friendly messages

### What must NOT be done in this phase

- No Receptionist/Mechanic/Client feature pages (except shared account)
- No notification API integration
- No invented endpoints

---

## Phase 5 — Receptionist module

### Objective

Implement reception operational pages: clients, intake, active orders, assign mechanic, inventory, purchases, invoicing, payments, global search.

### Scope

- `/reception/*` routes and navigation
- Workshop intake form (`CreateWorkshopIntakeRequest`)
- Create client with vehicle flow
- Order detail operations (no void)
- Global search hub

### Files/folders likely to be created

```
src/features/reception/**
src/api/workshopIntake.api.ts, receptionist.api.ts, search.api.ts
src/pages/reception/*
src/components/domain/WorkshopIntakeForm.tsx, ClientWithVehicleForm.tsx
```

### Requirements used

- `frontend-requirements.md` — Receptionist section
- Matrix sections 2.1–2.9

### Backend endpoints needed

Receptionist endpoints in `frontend-requirements.md` (dashboard, search, persons, clients vehicles, workshop-intake, service-orders workflow, mechanics assign, inventory, invoices, payments, catalogs/workshop).

### Open questions that may block the phase

None blocking (request bodies documented in `api-contract.md` §10).

### Acceptance criteria

- [ ] Receptionist can run daily flow without Admin UI: new client+vehicle → new order → assign mechanic → issue invoice → record payment
- [ ] Cannot void order, adjust stock, refund, or cancel invoice
- [ ] Global search returns results for each allowed search type
- [ ] Part staff approve/reject works from order detail

### What must NOT be done in this phase

- No Admin-only reports/audit/users
- No Mechanic work-performed pages
- No Client portal pages

---

## Phase 6 — Mechanic module

### Objective

Implement mechanic dashboard, assigned services, active orders, work recording, and part requests.

### Scope

- `/mechanic/*` routes
- Work performed form
- Part search and request
- Work history → **Pending backend confirmation** placeholder only

### Files/folders likely to be created

```
src/features/mechanic/**
src/api/mechanic.api.ts, orderServices.api.ts (shared)
src/pages/mechanic/*
```

### Requirements used

- `frontend-requirements.md` — Mechanic section
- Matrix sections 3.1–3.4

### Backend endpoints needed

- `GET /api/mechanic/dashboard`
- `GET /api/mechanic/my-assigned-services`
- `GET /api/mechanic/my-active-orders`
- `GET /api/service-orders/{id}/full-detail`
- `PUT /api/mechanic/order-services/{id}/work-performed`
- `PUT /api/order-services/{id}/work-report` (if exposed in UI)
- `POST /api/order-services/{id}/request-part`
- `PUT /api/order-service-parts/{id}/change-quantity`
- `GET /api/catalogs/workshop`, `GET /api/search/parts`

### Open questions that may block the phase

- **Work history** — placeholder only (Deferred)

### Acceptance criteria

- [ ] Mechanic sees only assigned/active data
- [ ] Can open order detail and submit work performed
- [ ] Can request part and change quantity when API allows
- [ ] Work history route shows pending confirmation message (no fake API)

### What must NOT be done in this phase

- No reception intake or invoicing
- No work history list with mock data
- No access to full `/api/order-services` list if role forbids

---

## Phase 7 — Client module

### Objective

Implement client portal: vehicles, orders, approvals, invoices, profile.

### Scope

- `/client/*` routes
- Approval approve/reject actions
- Invoice list + detail using **confirmed** endpoints only

### Files/folders likely to be created

```
src/features/client/**
src/api/clientVehicles.api.ts, clientApprovals.api.ts
src/pages/client/*
```

### Requirements used

- `frontend-requirements.md` — Client section
- Matrix sections 4.1–4.6

### Backend endpoints needed

- `GET /api/client/dashboard`
- `GET /api/client/my-vehicles`
- `GET /api/client/my-service-orders`
- `GET /api/service-orders/{id}/full-detail`
- `GET /api/client/pending-approvals`
- Client approval POST routes
- `GET /api/client/my-invoices`
- `GET /api/invoices/{id}/payment-summary`
- Account endpoints

### Open questions that may block the phase

- **Client add vehicle** — do not show action (Deferred)
- Ownership errors documented: 409 with `ClientCannotAccess*` codes

### Acceptance criteria

- [ ] Client sees only own vehicles, orders, invoices
- [ ] Pending approvals list with working approve/reject
- [ ] Order detail loads for own order; shows friendly error for others
- [ ] Invoice detail does not call `GET /api/invoices/{id}` as Client
- [ ] Profile and password change work via account endpoints

### What must NOT be done in this phase

- No staff/admin/reception/mechanic routes in client nav
- No `GET /api/invoices` full list
- No fake invoice detail API

---

## Phase 8 — UI polish, validation, testing and cleanup

### Objective

Harden UX, validation, accessibility, performance, and integration confidence across all roles.

### Scope

- Zod schemas aligned with api-contract validation
- Accessibility pass (focus, contrast, labels)
- Virtual scroll on heavy tables
- E2E smoke tests against local API (optional Playwright)
- Remove dead code; document env setup in README
- Resolve remaining open-questions where backend answered
- Confirm JWT header format in httpClient

### Files/folders likely to be created

```
src/validation/*.ts
e2e/smoke.spec.ts (optional)
README.md (frontend setup)
```

### Requirements used

- `design-system.md` — accessibility
- `api-contract.md` §15–16
- `open-questions.md` — close confirmed items

### Backend endpoints needed

All previously integrated endpoints; run backend E2E script referenced in api-contract §18 optional.

### Open questions that may block the phase

Any remaining **DTO** and **design** items in `open-questions.md` — polish can proceed in parallel but do not fake data.

### Acceptance criteria

- [ ] Critical paths tested: login per role, intake, approval, payment
- [ ] Forms show client-side validation before submit
- [ ] Keyboard navigation works on sidebar and modals
- [ ] No `console.error` from unhandled API failures in happy paths
- [ ] README documents `VITE_API_BASE_URL` and dev credentials
- [ ] Open-questions file updated with resolved/closed items dated

### What must NOT be done in this phase

- No new business scope without requirements update
- No mock servers replacing real API for demo
- No single mega-PR — keep fixes focused

---

## Phase summary table

| Phase | Focus | Key deliverable |
|-------|--------|-----------------|
| 1 | Setup | Vite app + tokens + primitives |
| 2 | Auth | Login, register, guards |
| 3 | Layout + dashboards | AppShell + 4 dashboards |
| 4 | Admin | Full admin operations |
| 5 | Receptionist | Workshop daily ops |
| 6 | Mechanic | Field execution |
| 7 | Client | Portal + approvals |
| 8 | Polish | A11y, validation, tests |

---

## Recommended next step after documentation

**Start Phase 1 only:** Initialize the Vite + React + TypeScript project in `AutoTallerManager-Frontend`, apply design tokens, and implement `httpClient` plus primitive UI components.

Before Phase 3 dashboards, **call each dashboard endpoint once** against local backend and record JSON shapes in `api-contract.md` or a generated `src/types/dashboard.types.ts` to close the dashboard DTO open question.

---

*Incremental plan — one phase per implementation prompt. Last updated: 2026-05-29.*
