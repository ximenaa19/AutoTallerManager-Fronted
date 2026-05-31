# AutoTallerManager — Frontend Requirements

> **Version:** 1.0  
> **Date:** 2026-05-29  
> **Status:** Requirements baseline for implementation  
> **Sources:** See [Source documents used](#source-documents-used). Backend truth: `docs/api-contract.md`.

---

## Project summary

AutoTallerManager is a **professional automotive workshop management** web application. The frontend provides role-based portals for administrators, receptionists, mechanics, and clients to manage users, clients, vehicles, service orders, inventory, invoicing, payments, reports, and audits.

The backend is an ASP.NET Core Web API with JWT authentication, 303 documented endpoints, and no response wrapper. The frontend must integrate against `docs/api-contract.md` only for confirmed behavior.

---

## Frontend objective

Deliver a **single-page application (SPA)** that:

1. Authenticates users and enforces role-based navigation.
2. Exposes each role’s operational pages defined in `pages-by-role.md`.
3. Maps UI actions to confirmed API endpoints with correct authorization.
4. Follows the visual design defined in `design-system.md` (dashboard reference image).
5. Defers any capability listed in `open-questions.md` until backend confirmation.

---

## Source documents used

| Document | Path | Purpose |
|----------|------|---------|
| API contract | `docs/api-contract.md` | **Source of truth** for endpoints, auth, DTOs, errors |
| Pages by role | `docs/requirements/source-documents/pages-by-role.md` | **Source of truth** for required pages |
| Role matrix | `docs/requirements/source-documents/role-functions-endpoints-matrix.md` | **Source of truth** for functions, permissions, actions |
| Dashboard reference | `docs/requirements/source-documents/dashboard-reference.jpeg` | Visual reference for layout and design system |

---

## Supported roles

| Role (English) | Backend role name | RoleId (seeded) | Primary focus |
|----------------|-------------------|-----------------|---------------|
| **Admin** | `Admin` | 1 | Full administration, catalogs, reports, audits, void/refund |
| **Client** | `Client` | 2 | Own vehicles, orders, invoices, approvals, profile |
| **Mechanic** | `Mechanic` | 3 | Assigned services, work reports, part requests |
| **Receptionist** | `Receptionist` | 4 | Daily workshop ops: clients, intake, orders, billing, payments |

Staff registration (`POST /api/staff/register`) supports **Admin**, **Receptionist**, and **Mechanic** only. Clients self-register via `POST /api/auth/register-client`.

---

## Shared pages

Available to all authenticated users (and public auth flows where noted).

| Page (English) | Spanish source label | Access | Primary endpoints |
|----------------|----------------------|--------|-------------------|
| **Login** | Login | Public | `POST /api/auth/login` |
| **Client registration** | Registro de cliente | Public | `GET /api/catalogs/public-registration`, `POST /api/auth/register-client` |
| **My profile** | Mi perfil | Authenticated | `GET /api/account/me`, `PUT /api/account/me` |
| **Change password** | Cambiar contraseña | Authenticated | `POST /api/account/change-password` |

**Session (not separate pages):** `POST /api/auth/refresh`, `POST /api/auth/logout`.

---

## Pages by role

### Admin (17 pages)

| # | Page (English) | Spanish source |
|---|----------------|----------------|
| 1 | Admin dashboard | Dashboard Admin |
| 2 | Users | Usuarios |
| 3 | Staff | Staff |
| 4 | Roles and permissions | Roles y permisos |
| 5 | Catalogs | Catálogos |
| 6 | Clients | Clientes |
| 7 | Vehicles | Vehículos |
| 8 | Service orders | Órdenes de servicio |
| 9 | Service order detail | Detalle de orden |
| 10 | Mechanics | Mecánicos |
| 11 | Inventory | Inventario |
| 12 | Spare parts purchases | Compras de repuestos |
| 13 | Invoicing | Facturación |
| 14 | Payments | Pagos |
| 15 | Reports | Reportes |
| 16 | Audit | Auditoría |
| 17 | Settings | Configuración |

### Receptionist (14 pages)

| # | Page (English) | Spanish source |
|---|----------------|----------------|
| 1 | Reception dashboard | Dashboard Recepción |
| 2 | Clients | Clientes |
| 3 | Create client with vehicle | Crear cliente con vehículo |
| 4 | Client detail | Detalle de cliente |
| 5 | Vehicles | Vehículos |
| 6 | New service order | Nueva orden de servicio |
| 7 | Active service orders | Órdenes activas |
| 8 | Service order detail | Detalle de orden |
| 9 | Assign mechanic | Asignar mecánico |
| 10 | Inventory | Inventario |
| 11 | Spare parts purchases | Compras de repuestos |
| 12 | Invoicing | Facturación |
| 13 | Record payment | Registrar pago |
| 14 | Global search | Búsqueda general |

### Mechanic (8 pages)

| # | Page (English) | Spanish source |
|---|----------------|----------------|
| 1 | Mechanic dashboard | Dashboard Mecánico |
| 2 | My assigned services | Mis servicios asignados |
| 3 | My active orders | Mis órdenes activas |
| 4 | Service detail | Detalle de servicio |
| 5 | Record work performed | Registrar trabajo realizado |
| 6 | Request spare parts | Solicitar repuestos |
| 7 | Search spare parts | Buscar repuestos |
| 8 | Work history | Historial de trabajos |

### Client (9 pages)

| # | Page (English) | Spanish source |
|---|----------------|----------------|
| 1 | Client dashboard | Dashboard Cliente |
| 2 | My vehicles | Mis vehículos |
| 3 | My service orders | Mis órdenes |
| 4 | Service order detail | Detalle de orden |
| 5 | Pending approvals | Aprobaciones pendientes |
| 6 | My invoices | Mis facturas |
| 7 | Invoice detail | Detalle de factura |
| 8 | My profile | Mi perfil |
| 9 | Change password | Cambiar contraseña |

> **Note:** Client “My profile” and “Change password” overlap with shared pages; implement once and reuse in the client layout.

**Approximate page counts:** Shared 4, Admin 17, Receptionist 14, Mechanic 8, Client 9 (52 total page concepts; some shared).

---

## Main modules

| Module | Description | Primary roles |
|--------|-------------|---------------|
| **Authentication** | Login, register, refresh, logout | All (public + session) |
| **Account** | Profile and password | All authenticated |
| **Dashboards** | Role-specific KPI summaries | Admin, Receptionist, Mechanic, Client |
| **Users & staff** | User CRUD, staff register, activate/deactivate | Admin |
| **Roles & permissions** | Roles and person-role assignments | Admin |
| **Catalogs** | Master data CRUD (20+ lookup tables) | Admin |
| **Clients & persons** | Person CRUD, client search, onboarding | Admin, Receptionist |
| **Vehicles** | Vehicle CRUD, ownership, entry inventory | Admin, Receptionist |
| **Service orders** | Intake, workflow, status, full detail | Admin, Receptionist, Mechanic, Client (read) |
| **Order services & parts** | Line items, mechanic assign, parts, approvals | Admin, Receptionist, Mechanic, Client (approve) |
| **Mechanics** | Specialties, assignments, mechanic workflow | Admin, Receptionist, Mechanic |
| **Inventory & parts** | Parts CRUD, stock, purchases | Admin, Receptionist |
| **Suppliers & purchases** | Suppliers, part purchases | Admin, Receptionist |
| **Invoicing** | Invoice CRUD and business actions | Admin, Receptionist |
| **Payments** | Record payment, summary, refund | Admin, Receptionist, Client (summary) |
| **Search** | Unified search by entity type | Admin, Receptionist, Mechanic (partial) |
| **Reports** | Admin analytics with date range | Admin |
| **Audit** | Audit logs and admin queries | Admin |

---

## Main workflows by role

### Admin

1. **Monitor workshop** — Open admin dashboard (`GET /api/admin/dashboard`).
2. **Manage users** — List/create/edit users; activate/deactivate staff accounts.
3. **Register staff** — Register receptionist or mechanic with specialties when applicable.
4. **Maintain catalogs** — CRUD on lookup tables (document types, service types, parts, geography, etc.).
5. **Operate clients & vehicles** — Search/list persons; manage vehicles and ownership.
6. **Manage service orders** — Full lifecycle: intake, status changes, void, complete, assign mechanics, staff part approvals.
7. **Inventory control** — View summary, low stock, adjust stock (Admin only), register purchases.
8. **Billing** — Generate/issue/cancel invoices; record payments; refund payments.
9. **Reporting** — Sales, inventory, mechanics, service orders, payments reports with optional `from`/`to`.
10. **Audit review** — Browse audits and admin audit queries.

### Receptionist

1. **Daily overview** — Reception dashboard.
2. **Client intake** — Create client with vehicle; search clients; view client detail with vehicles and orders.
3. **Workshop intake** — Create service order with entry inventory and initial services (`POST /api/workshop-intake/create-service-order`).
4. **Order operations** — View full detail, change status, cancel, complete; assign/unassign mechanics.
5. **Inventory & purchasing** — Low stock, register purchase, manage parts and suppliers (no stock adjust).
6. **Billing & payments** — Generate/issue invoices; record payments; view payment summary.
7. **Global search** — Clients, vehicles, orders, invoices, parts, suppliers, mechanics.

### Mechanic

1. **Shift overview** — Mechanic dashboard.
2. **Execute assigned work** — View assigned services and active orders; open order full detail.
3. **Report work** — `PUT /api/mechanic/order-services/{id}/work-performed` (and optionally staff work-report endpoint).
4. **Request parts** — Search parts; request part on order service; change quantity when allowed.

### Client

1. **Portal overview** — Client dashboard.
2. **Track assets** — View my vehicles and service orders.
3. **Approve costs** — Pending approvals for services and spare parts on orders.
4. **Review billing** — My invoices and payment summary per invoice.
5. **Manage account** — Profile and password.

---

## Required endpoints by page

Endpoints below are **confirmed in `api-contract.md`**. Pages marked ⚠️ have gaps documented in `open-questions.md`.

### Shared

| Page | Endpoints |
|------|-----------|
| Login | `POST /api/auth/login` |
| Client registration | `GET /api/catalogs/public-registration`, `POST /api/auth/register-client` |
| My profile | `GET /api/account/me`, `PUT /api/account/me` |
| Change password | `POST /api/account/change-password` |

### Admin

| Page | Key endpoints |
|------|---------------|
| Admin dashboard | `GET /api/admin/dashboard` |
| Users | `GET/POST/PUT/DELETE /api/users`, `PUT /api/users/{id}/activate`, `PUT /api/users/{id}/deactivate` |
| Staff | `POST /api/staff/register`, `GET/PUT /api/mechanics/{personId}/specialties` |
| Roles and permissions | `GET/POST/PUT/DELETE /api/roles`, `GET/POST/PUT/DELETE /api/person-roles` |
| Catalogs | CRUD on each catalog route (see [Catalog routes](#catalog-routes-admin)) |
| Clients | `GET /api/search/clients`, `GET/POST/PUT/DELETE /api/persons`, `POST /api/receptionist/create-client-with-vehicle`, `GET /api/clients/{personId}/vehicles`, `GET /api/clients/{personId}/service-orders`, `POST /api/clients/{personId}/vehicles` |
| Vehicles | `GET /api/search/vehicles`, `GET/POST/PUT/DELETE /api/vehicles`, `POST /api/vehicles/{vehicleId}/transfer-ownership`, `GET /api/vehicle-owner-histories`, `GET/POST/PUT/DELETE /api/vehicle-entry-inventories` |
| Service orders | `GET /api/search/service-orders`, `POST /api/workshop-intake/create-service-order`, `GET/POST/PUT/DELETE /api/service-orders`, `GET /api/service-orders/{id}/full-detail`, workflow: `change-status`, `cancel`, `void`, `complete` |
| Service order detail | Same as above + `GET /api/order-status-histories`, order-services and order-service-parts CRUD and business actions |
| Mechanics | `GET /api/search/mechanics`, `GET/PUT /api/mechanics/{personId}/specialties`, `GET/POST/PUT/DELETE /api/mechanic-assignments`, `GET/POST/PUT/DELETE /api/mechanic-specialty-assignments` |
| Inventory | `GET /api/inventory/summary`, `GET /api/inventory/low-stock`, `POST /api/inventory/adjust-stock`, `POST /api/inventory/register-purchase`, `GET/POST/PUT/DELETE /api/parts`, `GET /api/search/parts` |
| Spare parts purchases | `GET/POST/PUT/DELETE /api/suppliers`, `GET /api/search/suppliers`, `GET/POST/PUT/DELETE /api/part-purchases`, `GET/POST/PUT/DELETE /api/part-purchase-details`, `POST /api/inventory/register-purchase` |
| Invoicing | `GET /api/search/invoices`, `GET/POST/PUT/DELETE /api/invoices`, `POST /api/invoices/generate-from-service-order/{serviceOrderId}`, `POST /api/invoices/{id}/recalculate`, `POST /api/invoices/{id}/issue`, `POST /api/invoices/{id}/cancel`, `GET/POST/PUT/DELETE /api/invoice-details` |
| Payments | `GET/POST/PUT/DELETE /api/payments`, `POST /api/invoices/{id}/record-payment`, `GET /api/invoices/{id}/payment-summary`, `POST /api/payments/{id}/refund`, `GET/POST/PUT/DELETE /api/payment-cards` |
| Reports | `GET /api/admin/reports/sales`, `/inventory`, `/mechanics`, `/service-orders`, `/payments` |
| Audit | `GET/POST/PUT/DELETE /api/audits`, `GET /api/admin/audits/recent`, `GET /api/admin/audits/by-entity`, `GET /api/admin/audits/by-user/{userId}` |
| Settings ⚠️ | No dedicated endpoint — see `open-questions.md` |

#### Catalog routes (Admin)

`/api/document-types`, `/api/genders`, `/api/street-types`, `/api/vehicle-types`, `/api/vehicle-brands`, `/api/vehicle-models`, `/api/service-types`, `/api/mechanic-specialties`, `/api/part-categories`, `/api/part-brands`, `/api/payment-methods`, `/api/payment-statuses`, `/api/invoice-statuses`, `/api/order-statuses`, `/api/card-types`, `/api/audit-action-types`, `/api/countries`, `/api/departments`, `/api/cities`, `/api/neighborhoods`, `/api/email-domains` — each supports standard CRUD per api-contract.

### Receptionist

| Page | Key endpoints |
|------|---------------|
| Reception dashboard | `GET /api/receptionist/dashboard` |
| Clients | `GET /api/search/clients`, `GET /api/persons`, `GET /api/persons/{id}`, `PUT /api/persons/{id}` |
| Create client with vehicle | `POST /api/receptionist/create-client-with-vehicle`, `GET /api/catalogs/workshop` (for vehicle catalogs) |
| Client detail | `GET /api/persons/{id}`, `GET /api/clients/{personId}/vehicles`, `GET /api/clients/{personId}/service-orders` |
| Vehicles | `GET /api/vehicles`, `GET /api/vehicles/{id}`, `PUT /api/vehicles/{id}`, `POST /api/clients/{personId}/vehicles`, `POST /api/vehicles/{vehicleId}/transfer-ownership`, `GET /api/search/vehicles` |
| New service order | `GET /api/catalogs/workshop`, `GET /api/search/clients`, `GET /api/search/vehicles`, `POST /api/workshop-intake/create-service-order` |
| Active service orders | `GET /api/search/service-orders`, `GET /api/service-orders`, `GET /api/service-orders/{id}/full-detail` |
| Service order detail | `GET /api/service-orders/{id}/full-detail`, `POST .../change-status`, `POST .../cancel`, `POST .../complete`, `GET /api/order-status-histories`, order-service business endpoints, `POST /api/order-service-parts/{id}/approve`, `POST .../reject` |
| Assign mechanic | `GET /api/search/mechanics`, `GET /api/mechanics/{personId}/specialties`, `POST /api/order-services/{id}/assign-mechanic`, `POST /api/order-services/{id}/unassign-mechanic` |
| Inventory | `GET /api/inventory/summary`, `GET /api/inventory/low-stock`, `GET /api/search/parts`, `GET /api/parts`, `POST /api/inventory/register-purchase`, `GET /api/suppliers`, `GET /api/search/suppliers` |
| Spare parts purchases | Same as inventory purchase flow + supplier endpoints |
| Invoicing | `GET /api/search/invoices`, `POST /api/invoices/generate-from-service-order/{serviceOrderId}`, `POST /api/invoices/{id}/recalculate`, `POST /api/invoices/{id}/issue` |
| Record payment | `POST /api/invoices/{id}/record-payment`, `GET /api/invoices/{id}/payment-summary` |
| Global search | All `GET /api/search/*` routes allowed for Receptionist |

### Mechanic

| Page | Key endpoints |
|------|---------------|
| Mechanic dashboard | `GET /api/mechanic/dashboard` |
| My assigned services | `GET /api/mechanic/my-assigned-services` |
| My active orders | `GET /api/mechanic/my-active-orders` |
| Service detail | `GET /api/service-orders/{id}/full-detail`, `GET /api/search/service-orders` |
| Record work performed | `PUT /api/mechanic/order-services/{id}/work-performed`, `PUT /api/order-services/{id}/work-report` |
| Request spare parts | `GET /api/catalogs/workshop`, `GET /api/search/parts`, `POST /api/order-services/{id}/request-part`, `PUT /api/order-service-parts/{id}/change-quantity` |
| Search spare parts | `GET /api/search/parts` |
| Work history | **Deferred** — no backend endpoint; placeholder or hide nav (see `open-questions.md`) |

### Client

| Page | Key endpoints |
|------|---------------|
| Client dashboard | `GET /api/client/dashboard` |
| My vehicles | `GET /api/client/my-vehicles` |
| My service orders | `GET /api/client/my-service-orders` |
| Service order detail | `GET /api/service-orders/{id}/full-detail` |
| Pending approvals | `GET /api/client/pending-approvals`, `POST /api/client/approvals/order-services/{id}/approve|reject`, `POST /api/client/approvals/order-service-parts/{id}/approve|reject` |
| My invoices | `GET /api/client/my-invoices` |
| Invoice detail | `GET /api/client/my-invoices` (summary fields) + `GET /api/invoices/{id}/payment-summary` — Client cannot use `GET /api/invoices/{id}` |
| My profile / Change password | Account endpoints (shared) |

---

## Suggested frontend routes

Route prefixes group by role after login. Exact router library is an implementation choice (see implementation plan).

### Public

| Route | Page |
|-------|------|
| `/login` | Login |
| `/register` | Client registration |

### Authenticated (all roles)

| Route | Page |
|-------|------|
| `/account/profile` | My profile |
| `/account/change-password` | Change password |

### Admin (`/admin`)

| Route | Page |
|-------|------|
| `/admin` or `/admin/dashboard` | Admin dashboard |
| `/admin/users` | Users |
| `/admin/users/:id` | User detail (optional) |
| `/admin/staff` | Staff |
| `/admin/roles` | Roles and permissions |
| `/admin/catalogs` | Catalog hub |
| `/admin/catalogs/:catalogKey` | Single catalog CRUD |
| `/admin/clients` | Clients |
| `/admin/clients/:personId` | Client detail |
| `/admin/vehicles` | Vehicles |
| `/admin/vehicles/:id` | Vehicle detail |
| `/admin/service-orders` | Service orders |
| `/admin/service-orders/:id` | Service order detail |
| `/admin/mechanics` | Mechanics |
| `/admin/inventory` | Inventory |
| `/admin/purchases` | Spare parts purchases |
| `/admin/invoices` | Invoicing |
| `/admin/invoices/:id` | Invoice detail |
| `/admin/payments` | Payments |
| `/admin/reports` | Reports |
| `/admin/reports/:reportKey` | Single report view |
| `/admin/audit` | Audit |
| `/admin/settings` | Settings (placeholder until confirmed) |

### Receptionist (`/reception`)

| Route | Page |
|-------|------|
| `/reception` or `/reception/dashboard` | Reception dashboard |
| `/reception/clients` | Clients |
| `/reception/clients/new` | Create client with vehicle |
| `/reception/clients/:personId` | Client detail |
| `/reception/vehicles` | Vehicles |
| `/reception/service-orders/new` | New service order |
| `/reception/service-orders` | Active service orders |
| `/reception/service-orders/:id` | Service order detail |
| `/reception/service-orders/:id/assign-mechanic` | Assign mechanic (or section in detail) |
| `/reception/inventory` | Inventory |
| `/reception/purchases` | Spare parts purchases |
| `/reception/invoices` | Invoicing |
| `/reception/payments/record` | Record payment (or modal from invoice) |
| `/reception/search` | Global search |

### Mechanic (`/mechanic`)

| Route | Page |
|-------|------|
| `/mechanic` or `/mechanic/dashboard` | Mechanic dashboard |
| `/mechanic/assigned-services` | My assigned services |
| `/mechanic/active-orders` | My active orders |
| `/mechanic/orders/:id` | Service / order detail |
| `/mechanic/work/:orderServiceId` | Record work performed |
| `/mechanic/parts/request` | Request spare parts |
| `/mechanic/parts/search` | Search spare parts |
| `/mechanic/history` | Work history (placeholder until confirmed) |

### Client (`/client`)

| Route | Page |
|-------|------|
| `/client` or `/client/dashboard` | Client dashboard |
| `/client/vehicles` | My vehicles |
| `/client/service-orders` | My service orders |
| `/client/service-orders/:id` | Service order detail |
| `/client/approvals` | Pending approvals |
| `/client/invoices` | My invoices |
| `/client/invoices/:id` | Invoice detail |
| `/client/account/profile` | My profile (alias to shared) |
| `/client/account/change-password` | Change password (alias to shared) |

### Post-login redirect

| Role | Default route |
|------|---------------|
| Admin | `/admin/dashboard` |
| Receptionist | `/reception/dashboard` |
| Mechanic | `/mechanic/dashboard` |
| Client | `/client/dashboard` |

---

## Main UI components needed by page

### Layout (all authenticated roles)

- `AppShell` — sidebar + topbar + main content
- `SidebarNav` — role-filtered navigation from pages-by-role
- `TopBar` — search, notifications placeholder, help, user menu, optional date control
- `RoleGuard` — route protection by JWT roles
- `Breadcrumbs` — hierarchical navigation on detail pages

### Shared / auth

- `LoginForm`
- `ClientRegistrationWizard` (catalog-driven steps)
- `ProfileForm`, `ChangePasswordForm`
- `AuthProvider` / session handler (refresh on 401)

### Dashboards

- `DashboardPageHeader` — title + subtitle
- `MetricCardGrid` — KPI cards (icon, title, value, footer, trend)
- `DashboardDateRange` — only where API supports `from`/`to` (reports); admin dashboard date control is ⚠️

### Data display

- `DataTable` — sortable columns, row actions (no server pagination)
- `SearchInput` — debounced, calls `/api/search/*?term=`
- `StatusBadge` — order, invoice, payment statuses (seeded IDs)
- `EmptyState`, `LoadingSkeleton`, `ErrorAlert`
- `ConfirmDialog` — destructive actions (delete, void, cancel, refund)

### Domain-specific

- `PersonForm`, `ClientWithVehicleForm`
- `VehicleForm`, `OwnershipTransferDialog`
- `WorkshopIntakeForm` — vehicle, entry inventory checklist, services list
- `ServiceOrderDetailPanel` — full-detail layout: inventory, services, parts, invoice, payments
- `OrderStatusTimeline` — from order status histories
- `MechanicAssignDialog` — mechanic + specialty selection
- `WorkPerformedForm`, `WorkReportForm`
- `PartRequestDialog`, `PartSearchResults`
- `ApprovalCardList` — client pending approvals
- `InvoiceActionsBar` — generate, recalculate, issue, cancel
- `RecordPaymentForm` — method, amount, optional card block
- `CatalogCrudPage` — generic admin catalog editor
- `ReportChartTable` — report visualization (shape TBD)
- `AuditLogTable`

---

## Role-based restrictions

Enforced **on the backend**; UI must mirror restrictions to avoid dead ends.

| Capability | Admin | Receptionist | Mechanic | Client |
|------------|:-----:|:------------:|:--------:|:------:|
| User CRUD / activate / deactivate | ✓ | — | — | — |
| Staff register | ✓ | — | — | — |
| Roles / person-roles CRUD | ✓ | — | — | — |
| Catalog CRUD (lookup tables) | ✓ | — | — | — |
| `POST /api/inventory/adjust-stock` | ✓ | — | — | — |
| `POST /api/service-orders/{id}/void` | ✓ | — | — | — |
| `POST /api/invoices/{id}/cancel` | ✓ | — | — | — |
| `POST /api/payments/{id}/refund` | ✓ | — | — | — |
| Workshop intake / create orders | ✓ | ✓ | — | — |
| Assign / unassign mechanic | ✓ | ✓ | — | — |
| Staff approve/reject order-service-parts | ✓ | ✓ | — | — |
| Record payment | ✓ | ✓ | — | — |
| Mechanic work-performed / request-part | — | — | ✓ | — |
| Client approvals | — | — | — | ✓ |
| `GET /api/invoices` (full list) | ✓ | ✓ | — | — |
| `GET /api/client/my-*` scoped data | — | — | — | ✓ |
| Reports & admin audits | ✓ | — | — | — |
| `GET /api/catalogs/workshop` | ✓ | ✓ | ✓ | — |

**Multi-role users:** JWT may include multiple `role` claims. **Frontend decision:** role picker or priority Admin → Receptionist → Mechanic → Client (see `open-questions.md`).

---

## Pages that can be implemented now

All endpoints exist in `api-contract.md` and support the primary user journey:

| Area | Pages |
|------|-------|
| Auth | Login, client registration, session refresh/logout |
| Account | My profile, change password |
| Dashboards | Admin, reception, mechanic, client (UI binds to dashboard DTOs once shapes are confirmed from live API or backend docs) |
| Admin core | Users, staff, roles, catalogs (CRUD pattern), clients, vehicles, service orders + detail, mechanics, inventory, purchases, invoicing, payments, reports, audit |
| Receptionist core | Dashboard, clients, create client with vehicle, client detail, vehicles, new order, active orders, order detail, assign mechanic, inventory, purchases, invoicing, record payment, search |
| Mechanic core | Dashboard, assigned services, active orders, service detail, record work, request/search parts |
| Client core | Dashboard, my vehicles, my orders, order detail, pending approvals, my invoices |

Use **client-side filtering** on full list responses (no server pagination).

---

## Pages that must wait for backend confirmation

Do **not** implement real functionality until resolved in `open-questions.md`:

| Page | Status | Reason |
|------|--------|--------|
| Admin **Settings** | Deferred | No settings API in backend |
| Mechanic **Work history** | Deferred | No history endpoint |
| Top bar **notifications** | Deferred | No notification API |
| Admin dashboard **date filter** (API-driven) | Resolved — omit | Dashboard has no `from`/`to`; use reports for date range |

**Can implement now (confirmed):** Client **Invoice detail** using `ClientInvoiceSummaryDto` + `payment-summary` (see `api-contract.md` §9).

Placeholder pages for deferred items may show **“Not available”** or hide navigation entries.

---

## Notes for frontend implementation

1. **Single source of truth:** Never call endpoints not listed in `api-contract.md`. Track gaps only in `open-questions.md`.
2. **Error handling:** Parse `{ code, message }` on 400/404/409/500; 401 triggers refresh then login; 403 shows access denied.
3. **No fake services:** Do not mock unconfirmed endpoints in production code paths.
4. **Lists:** Expect full arrays; implement virtual scroll or client-side filter for large datasets.
5. **Search:** All search routes require query param `term`.
6. **Catalogs:** Use `GET /api/catalogs/workshop` for operational forms; public registration catalog for client signup.
7. **IDs:** Use seeded status IDs from api-contract (e.g. OrderStatus, InvoiceStatus) for labels and badges.
8. **Security:** Hide UI by role for UX only; never rely on UI alone for authorization.
9. **Language:** UI copy in English; preserve backend route paths and role names exactly (`Admin`, `Receptionist`, etc.).
10. **Incremental delivery:** Follow `docs/planning/frontend-implementation-plan.md` one phase per iteration.

---

*Generated from source documents. Last updated: 2026-05-29.*
