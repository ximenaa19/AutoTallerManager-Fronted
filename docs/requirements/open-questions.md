# AutoTallerManager — Open Questions

> **Version:** 2.0  
> **Date:** 2026-05-29  
> **Backend review:** `AutoTallerManager-Backend` Application + Api layers (read-only audit)

**Implementation rule:** Items marked **Deferred** or **Still needs backend confirmation** must not use production API wiring. **Frontend decision** items may be implemented without backend changes.

**Authoritative API detail:** `docs/api-contract.md` (updated after this review).

---

## Status summary

| Status | Count | Meaning |
|--------|------:|---------|
| **Resolved from backend** | 22 | Confirmed in backend source; documented in `api-contract.md` |
| **Frontend decision** | 5 | No backend API required; UI/product choice |
| **Deferred / Not supported by backend yet** | 6 | Not implemented in current backend |
| **Still needs backend confirmation** | 2 | Deployment/ops or future roadmap not in code |

---

# Resolved from backend

## Dashboard response shapes

**Status:** Resolved from backend

**Related page/feature:** All role dashboards

**Confirmed in:** `Application/Features/Dashboards/Dtos/*.cs`, `DashboardsController.cs` (no query params)

**Resolution:** Full property lists added to `api-contract.md` §9 Dashboards and §10 TypeScript. Admin dashboard returns 13 KPI fields including monetary totals; reference mockup may show extra labels not in API.

---

## Report DTO shapes

**Status:** Resolved from backend

**Related page/feature:** Admin → Reports

**Confirmed in:** `Application/Features/Reports/Dtos/*.cs`, `ReportsController.cs` (`from`, `to` query optional)

**Resolution:** Documented in `api-contract.md` §10 Reports.

---

## PendingApprovalDto shape

**Status:** Resolved from backend

**Related page/feature:** Client → Pending approvals

**Confirmed in:** `PendingApprovalDto.cs`, `PendingOrderServiceApprovalDto.cs`, `PendingOrderServicePartApprovalDto.cs`

**Resolution:** Documented in `api-contract.md` §10.

---

## Search result DTO shapes

**Status:** Resolved from backend

**Related page/feature:** Global search

**Confirmed in:** `Application/Features/Search/Dtos/*.cs`

**Resolution:** All seven search result types in `api-contract.md` §10.

---

## Entity CRUD DTOs

**Status:** Resolved from backend

**Related page/feature:** All CRUD modules

**Confirmed in:** 103 `*Dto.cs` files under `Application/Features/*/Dtos/`; requests under `.../Requests/`

**Resolution:** `api-contract.md` §10 includes CRUD index and path convention. Copy types from backend per module during implementation (listing every field in the contract is unnecessary when source is in-repo).

---

## Workshop and business DTOs

**Status:** Resolved from backend

**Related page/feature:** Intake, client+vehicle, staff, inventory, invoices

**Confirmed in:** `WorkshopIntake`, `ClientVehicleFlows`, `Staff`, `InventoryBusiness`, `InvoiceBusiness`, `PaymentBusiness` feature folders

**Resolution:** Key request/response types in `api-contract.md` §10 (workshop, staff, payment summary, generated invoice, inventory summary, etc.).

---

## UpdateWorkPerformedRequest (Mechanic)

**Status:** Resolved from backend

**Related page/feature:** Mechanic → Record work performed

**Confirmed in:** `Application/Features/ServiceExecution/Requests/UpdateWorkPerformedRequest.cs`

**Resolution:** Fields: `workPerformed?`, `laborCost` (decimal). Documented in `api-contract.md` §9 Mechanic workflow and §10.

---

## Transfer ownership request body

**Status:** Resolved from backend

**Related page/feature:** Vehicles → Transfer ownership

**Confirmed in:** `TransferVehicleOwnershipRequest.cs` — `newOwnerPersonId`, `transferDate?`

**Resolution:** Documented in `api-contract.md` §9 Client vehicles.

---

## ServiceExecutionResultDto

**Status:** Resolved from backend

**Confirmed in:** `ServiceExecutionResultDto.cs` — `id`, `entity`, `action`, `success`

**Resolution:** `api-contract.md` §10.

---

## Client my-vehicles / my-invoices list items

**Status:** Resolved from backend

**Confirmed in:** `ClientVehicleDto.cs`, `ClientInvoiceSummaryDto.cs`, `ClientServiceOrderSummaryDto.cs`

**Resolution:** `api-contract.md` §10 Client portal lists.

---

## Server-side pagination

**Status:** Resolved from backend

**Confirmed in:** `PaginationRequest` / `PagedResult<T>` exist; **zero** controller references

**Resolution:** Frontend uses full arrays + client-side filtering until backend adds pagination. Documented in `api-contract.md` §6.

---

## List filtering and sorting

**Status:** Resolved from backend

**Confirmed in:** Controllers — search uses `term` only; reports use `from`/`to`; dashboards have no filters

**Resolution:** Documented in `api-contract.md` §6.

---

## Client access denied on full-detail / payment-summary

**Status:** Resolved from backend

**Confirmed in:** `ServiceOrderWorkflowErrors.ClientCannotAccessServiceOrderConflict`, `PaymentBusinessErrors.ClientCannotAccessInvoiceConflict` → mapped to **HTTP 409** via `BaseApiController` (`Conflict` suffix)

**Resolution:** Not 403. Frontend should show access denied on 409 with these codes. Missing id → 404 `*.NotFound`. Documented in `api-contract.md` §10 and §16.

---

## JWT Authorization header format

**Status:** Resolved from backend

**Confirmed in:** `AddJwtBearer` in `Api/Program.cs`; OpenAPI scheme `Type = Http`, `Scheme = bearer`

**Resolution:** Use `Authorization: Bearer {accessToken}`. Swagger UI hint is cosmetic. `api-contract.md` §4.

---

## HTTPS vs HTTP in local development

**Status:** Resolved from backend

**Confirmed in:** `launchSettings.json` — HTTP profile `http://localhost:5077`; E2E uses HTTP

**Resolution:** Default `VITE_API_BASE_URL=http://localhost:5077`. `api-contract.md` §4.

---

## Field-level validation errors

**Status:** Resolved from backend

**Confirmed in:** `BaseApiController.MapError` — single `{ code, message }`; no field array

**Resolution:** Frontend duplicates rules from `Application/Features/*/Errors/` and request validation. `api-contract.md` §6.

---

## Rate limiting

**Status:** Resolved from backend

**Confirmed in:** No rate-limiting middleware or attributes in Api project

**Resolution:** Not implemented. No 429 handling required until backend adds it.

---

## One invoice per service order rule

**Status:** Resolved from backend

**Confirmed in:** `InvoiceBusinessService.GenerateFromServiceOrderAsync` — `InvoiceBusinessErrors.ServiceOrderAlreadyHasInvoiceConflict` → **409**

**Resolution:** Documented in `api-contract.md` §9 Invoicing and §16.

---

## Dashboard global date filter

**Status:** Resolved from backend

**Confirmed in:** `DashboardsController` — no `[FromQuery]` parameters

**Resolution:** **Not supported.** Date range only on `/api/admin/reports/*`. Do not add dashboard date picker wired to API (Frontend decision: optional display-only date).

---

## Client self-service add vehicle

**Status:** Resolved from backend

**Confirmed in:** `ClientVehiclesController` — Client role only on GET `my-vehicles`; POST vehicles is Admin/Receptionist on `/api/clients/{personId}/vehicles`

**Resolution:** Clients **cannot** add vehicles via API. Hide action in client portal (Deferred if product later adds endpoint).

---

## Client invoice detail (full invoice GET)

**Status:** Resolved from backend

**Confirmed in:** `InvoicesController` — `[Authorize(Roles = "Admin,Receptionist")]` on GET by id; Client uses `my-invoices` + `payment-summary`

**Resolution:** Client invoice page = `ClientInvoiceSummaryDto` (list) + `GET /api/invoices/{id}/payment-summary`. No `GET /api/invoices/{id}` for Client. `api-contract.md` §9.

---

## Fine-grained permissions beyond role names

**Status:** Resolved from backend

**Confirmed in:** `[Authorize(Roles = "...")]` on controllers; `Roles` / `PersonRoles` CRUD are data admin, not permission claims

**Resolution:** “Roles and permissions” page = **role catalog + person-role assignments** only. No separate permission matrix API.

---

## Endpoints in role matrix vs api-contract

**Status:** Resolved from backend

**Resolution:** Re-confirmed 2026-05-29 — matrix endpoints match controllers. No gaps.

---

## Mechanic work history in pages vs matrix

**Status:** Resolved from backend (scope clarification)

**Resolution:** Page has **no** backend endpoint. Treat as Deferred (below) or Frontend decision to repurpose `my-assigned-services` with client filter.

---

# Frontend decision

## Multi-role user navigation

**Status:** Frontend decision

**Related page/feature:** Post-login routing

**Problem:** JWT may include multiple `role` claims; backend does not define a default landing role.

**Recommended decision:** If `roles.length > 1`, show a **role picker** once per session, then store selected role in session storage for nav + guards. Priority fallback if no picker: Admin → Receptionist → Mechanic → Client.

---

## Client profile pages duplicated

**Status:** Frontend decision

**Related page/feature:** Shared vs Client account pages

**Recommended decision:** Single routes `/account/profile` and `/account/change-password` for all roles; client nav links alias to same pages.

---

## Dashboard reference / design tokens

**Status:** Frontend decision

**Related page/feature:** `design-system.md`

**Problem:** Hex/spacing from image approximation; notification/date controls in mockup.

**Recommended decision:** Use `design-system.md` tokens; **omit** notification badge and dashboard date filter unless product adds APIs later.

---

## Light theme

**Status:** Frontend decision

**Recommended decision:** **Dark-only MVP** per reference image; add light theme later if needed.

---

## Mechanic work history page UX (without new API)

**Status:** Frontend decision

**Recommended decision:** Either **remove** nav item until backend adds history endpoint, or show **placeholder** “Not available” — do not fabricate history from unrelated endpoints. Optional: link to “My assigned services” as interim.

---

# Deferred / Not supported by backend yet

## Admin Settings page has no API

**Status:** Deferred / Not supported by backend yet

**Related page/feature:** Admin → Settings

**Problem:** No `/api/settings` or configuration controller in backend.

**Decision needed:** Backend feature or remove from Admin nav; until then use placeholder only.

---

## Mechanic work history has no list endpoint

**Status:** Deferred / Not supported by backend yet

**Related page/feature:** Mechanic → Work history

**Problem:** Only `GET /api/mechanic/my-assigned-services` and `GET /api/mechanic/my-active-orders` exist.

**Decision needed:** New endpoint (e.g. completed services by mechanic) or drop page from scope.

---

## In-app notifications API missing

**Status:** Deferred / Not supported by backend yet

**Related page/feature:** Top bar notification bell

**Problem:** No notification controllers or entities in backend.

**Decision needed:** Implement notifications module or hide UI.

---

## Client POST vehicle (self-service)

**Status:** Deferred / Not supported by backend yet

**Related page/feature:** Client → My vehicles → Add

**Problem:** No client-scoped vehicle create endpoint.

**Decision needed:** New `POST /api/client/...` or keep staff-only intake.

---

# Still needs backend confirmation

## Production CORS origins

**Status:** Still needs backend confirmation

**Related page/feature:** Production deploy

**Problem:** `Program.cs` only allows `localhost:3000`, `5173`, `4200`. Production SPA origin not in source.

**Decision needed:** Ops/backend team to add production origin(s) before go-live.

---

## Server-side pagination roadmap

**Status:** Still needs backend confirmation

**Related page/feature:** Large list performance

**Problem:** Pagination types exist but unused; no comment/TODO indicating planned rollout.

**Decision needed:** Product/backend confirm if/when `PagedResult` will be adopted on list endpoints.

---

# Phase 4.1 — Admin Users, Staff, Roles (2026-05-31)

## UserDto field list not in api-contract §10 prose

**Status:** Resolved for frontend implementation (typed from CRUD index + backend DTO convention)

**Related page/feature:** Admin → Users

**Problem:** `GET /api/users` returns `UserDto` with only `userId`, `personId`, `isActive`, and `createdAt` — no email, name, or roles on the user record itself.

**Frontend handling:** Users table shows person ID and joins active role labels from `GET /api/person-roles` + `GET /api/roles`. Display names/emails require a future persons lookup or enriched user endpoint.

---

## CreateUserRequest / UpdateUserRequest shapes

**Status:** Resolved for frontend implementation (typed per api-contract §10 CRUD index convention)

**Related page/feature:** Admin → Users create/edit modals

**Confirmed fields:**

- **Create:** `personId`, `password`, `isActive`
- **Update:** `personId`, `newPassword?`, `isActive`

**Note:** Full JSON examples are not yet written in `api-contract.md` §10 prose; types follow `Application/Features/Users/Requests/`.

---

## ReplaceMechanicSpecialtiesRequest body

**Status:** Resolved for frontend implementation

**Related page/feature:** Admin → Staff (mechanic specialties via registration); optional `PUT /api/mechanics/{personId}/specialties`

**Confirmed body:** `{ specialtyIds?: number[] }`

**Response:** `MechanicSpecialtySummaryDto[]` (`assignmentId`, `specialtyId`, `specialtyName`)

**Note:** Request/response TypeScript blocks not yet added to `api-contract.md` §10; staff registration uses `RegisterStaffRequest.specialtyIds` instead.

---

## No staff list endpoint

**Status:** Frontend decision (documented)

**Related page/feature:** Admin → Staff

**Resolution:** Staff page is registration-only (`POST /api/staff/register`). Existing staff accounts are managed from Users + Roles pages.

---

## PersonDto lacks email and phone in list response

**Status:** Resolved for frontend implementation

**Related page/feature:** Admin → Users person selector (`GET /api/persons`)

**Problem:** `PersonDto` includes identity fields (name, document number, person ID) but not primary email or phone. Those live on related `PersonEmails` / `PersonPhones` entities.

**Frontend handling:** Person selector displays full name, document number, and person ID. Email/phone are not shown until a future enriched persons lookup is documented.

---

# Phase 4.2 — Admin Catalogs (2026-05-31)

## Admin catalog CRUD request body fields not in api-contract §10 prose

**Status:** Partial — read-only where create/update fields are undocumented

**Related page/feature:** Admin → Catalogs (`/admin/catalogs`, `/admin/catalogs/:catalogKey`)

**Problem:** `api-contract.md` §9 lists CRUD routes and `Create{Entity}Request` / `Update{Entity}Request` type names for all 20 admin catalog resources, but §10 does not document JSON field lists for most catalog create/update bodies (unlike `PersonDto` / `RegisterClientRequest` examples).

**Frontend handling (Phase 4.2):**

- **Full CRUD** enabled only for simple name-based catalogs where list response fields are typed using `MechanicSpecialtyDto` (`specialtyId`, `name`) as the confirmed exemplar plus api-contract FK naming (`genderId`, `serviceTypeId`, etc.): genders, street-types, vehicle-types, service-types, mechanic-specialties, order-statuses, part-categories, part-brands, payment-methods, payment-statuses, invoice-statuses, card-types, audit-action-types.
- **Read-only** (GET list/display only; no create/edit/delete UI) for catalogs whose response or request shapes are not documented in §10 prose: document-types (`code` + `name`), email-domains (`domain`), countries (`phoneCode`), departments, cities, neighborhoods (FK hierarchy).

**Update (2026-05-31):** Vehicle Brands and Vehicle Models CRUD confirmed from backend source and documented in `api-contract.md` §9 — full CRUD enabled in Admin Catalogs.

---

## Vehicle Brands and Vehicle Models CRUD request bodies

**Status:** Resolved — full CRUD enabled in Admin Catalogs

**Related page/feature:** Admin → Catalogs → Vehicle Brands / Vehicle Models; Create Client With Vehicle model dropdown

**Confirmed in:** `Application/Features/VehicleBrands/*`, `Application/Features/VehicleModels/*`, `VehicleBrandsController.cs`, `VehicleModelsController.cs`

**Response DTOs:**

- `VehicleBrandDto`: `{ brandId, brandName }`
- `VehicleModelDto`: `{ modelId, brandId, modelName }`

**Create/update bodies:**

- `CreateVehicleBrandRequest` / `UpdateVehicleBrandRequest`: `{ brandName }` — required, max 80, unique
- `CreateVehicleModelRequest` / `UpdateVehicleModelRequest`: `{ brandId, modelName }` — brand must exist; model name required, max 80, unique per brand

**Frontend handling:** Admin catalog pages `/admin/catalogs/vehicle-brands` and `/admin/catalogs/vehicle-models` support create, edit, and delete. Vehicle Models form uses a brand select loaded from Vehicle Brands.

---

## Catalog list response field names vs CatalogItemDto

**Status:** Resolved for frontend implementation (admin CRUD uses entity DTOs, not aggregated catalogs)

**Related page/feature:** Admin catalog detail tables

**Note:** `GET /api/catalogs/public-registration` and `GET /api/catalogs/workshop` return `CatalogItemDto` (`id`, `name`). Admin CRUD endpoints return entity-specific DTOs with typed primary keys (e.g. `genderId`, `specialtyId`, `brandId`). The admin catalogs module uses entity DTO field names from the CRUD index and `MechanicSpecialtyDto`; validate against live API during QA.

---

# Phase 4.3 — Admin Customers and Vehicles (2026-05-31)

## POST /api/clients/{personId}/vehicles request body

**Status:** Partially resolved (2026-06-02) — request body documented; add-vehicle UI still deferred

**Related page/feature:** Admin → Customers detail → Add vehicle

**Resolution:** `AddVehicleToClientRequest` is documented in `api-contract.md` §9 (Client vehicles) and §10, including required `plate` with the same validation rules as vehicle CRUD.

**Frontend handling:** Customer detail shows linked vehicles via GET `/api/clients/{personId}/vehicles` only. Add-vehicle action is not exposed until a form is implemented in the Admin Customers module.

---

## Vehicle create/update request bodies (POST/PUT /api/vehicles)

**Status:** Resolved (2026-05-31, Phase 4.4.1)

**Related page/feature:** Admin → Vehicles list/detail

**Confirmed in:** `VehiclesController.cs`, `CreateVehicleRequest.cs`, `UpdateVehicleRequest.cs`, `VehicleDto.cs`, `VehicleService.cs`

**Resolution:** Request/response fields documented in `api-contract.md` §9 (Vehicles CRUD) and §10. Admin Vehicles supports create and edit via modal form (model, type, VIN, year, color, mileage, active flag). Catalog selects use GET `/api/vehicle-types`, `/api/vehicle-models`, `/api/vehicle-brands`.

---

## VehicleOwnerHistoryDto and VehicleEntryInventoryDto

**Status:** Deferred — panels not wired

**Related page/feature:** Admin → Vehicle detail → Owner history / Entry inventory

**Problem:** GET list routes exist in §9, but §10 does not document response field names or how to filter rows by `vehicleId`.

**Frontend handling:** Vehicle detail page shows deferred placeholders. Do not call these endpoints for display until DTO tables are added to `api-contract.md` §10.

---

## Admin customers route path vs “customers” label

**Status:** Resolved for frontend implementation

**Related page/feature:** Sidebar “Customers” nav item

**Resolution:** Product route remains `/admin/clients` per `frontend-requirements.md`. UI copy uses “Customers”; no `/admin/customers` route added.

---

# Phase 4.4 — Admin Service Orders (2026-05-31)

## OrderServiceDto / CreateOrderServiceRequest / UpdateOrderServiceRequest

**Status:** Resolved (2026-05-31, Phase 4.4.1)

**Related page/feature:** Admin → Service order detail → Services panel

**Confirmed in:** `OrderServicesController.cs`, `OrderServiceDto.cs`, `CreateOrderServiceRequest.cs`, `UpdateOrderServiceRequest.cs`, `OrderServiceService.cs`

**Resolution:** Documented in `api-contract.md` §9 and §10. Add/edit/delete line items enabled on service order detail when parent order is not Cancelled/Voided. Assign/unassign mechanic, work report, and request part unchanged.

---

## OrderStatusHistoryDto

**Status:** Deferred — status history panel not wired

**Related page/feature:** Admin → Service order detail → Status history

**Problem:** GET `/api/order-status-histories` is listed in §9, but §10 does not document `OrderStatusHistoryDto` response fields (e.g. `serviceOrderId`, status transition, observation, timestamp).

**Frontend handling:** Detail page shows a deferred placeholder. Do not fetch or render history rows until DTO fields are added to `api-contract.md` §10.

---

## CreateServiceOrderRequest / UpdateServiceOrderRequest (direct CRUD)

**Status:** Partially resolved (2026-05-31, Phase 4.4.1)

**Related page/feature:** Admin → Service orders

**Confirmed in:** `ServiceOrdersController.cs`, `UpdateServiceOrderRequest.cs`, `ServiceOrderService.cs`

**Resolution:** `PUT /api/service-orders/{id}` body documented in `api-contract.md`. Admin service order detail exposes **Edit order** for header fields (vehicle, entry date, estimated delivery, general description). Status changes remain workflow-only (`change-status`, `cancel`, `void`, `complete`). **Create** still uses workshop intake (`POST /api/workshop-intake/create-service-order`); direct `POST /api/service-orders` is not exposed in Admin UI.

---

## POST /api/inventory/register-purchase — server 500 (EF Update on new purchase)

**Status:** Resolved (2026-06-01)

**Related page/feature:** Admin → Purchases → Register purchase

**Confirmed in:** `InventoryBusinessService.RegisterPurchaseAsync` — after `AddAsync(purchase)`, the service previously called `purchaseRepository.Update(purchase)` while `PartPurchaseId` was still temporary, causing `System.InvalidOperationException` and HTTP 500.

**Resolution:** Backend no longer calls `Update` on a newly inserted `PartPurchase` before EF Core assigns the real ID. Frontend uses only `POST /api/inventory/register-purchase` (temporary CRUD fallback removed).

---

## Part `name` / `partName` field

**Status:** Resolved — not exposed (2026-06-01)

**Related page/feature:** Admin → Purchases → Register purchase → part search

**Confirmed in:** `PartDto`, `PartSearchResultDto`, `Part` entity — fields are `code` and `description` only.

**Frontend handling:** UI treats **`description`** as the primary catalog label (title line). Secondary line shows `Code`, `Stock`, and `Unit price`. No `partName` is invented.

---

## POST /api/part-purchases (header-only create)

**Status:** Resolved — not used for register flow (2026-06-01)

**Related page/feature:** Admin → Purchases

**Problem:** `CreatePartPurchaseRequest` only includes `supplierId` and `purchaseDate`. It does not create line items or update stock by itself.

**Frontend handling:** Register purchase uses `POST /api/inventory/register-purchase` only. Standalone “create empty purchase” is not exposed in the UI. Purchase header edits use `PUT /api/part-purchases/{id}` (supplier and date only).

---

## Part purchase detail CRUD (standalone)

**Status:** Deferred (2026-05-31, Phase 4.5)

**Related page/feature:** Admin → Purchases → line item maintenance

**Problem:** `POST/PUT/DELETE /api/part-purchase-details` are documented, but changing lines after registration may not match inventory/stock business rules. No explicit workflow contract for post-registration line edits.

**Frontend handling:** Line items are read-only in the purchase detail modal (from `GET /api/part-purchase-details`). New lines are added only via **Register purchase**.

---

# Phase 4.6 — Admin Invoicing and Payments (2026-06-01)

## InvoiceDto / PaymentDto / InvoiceDetailDto field lists

**Status:** Resolved from backend (2026-06-01)

**Related page/feature:** Admin → Invoicing, Payments, Invoice detail

**Confirmed in:** `Application/Features/Invoices/Dtos/InvoiceDto.cs`, `Payments/Dtos/PaymentDto.cs`, `InvoiceDetails/Dtos/InvoiceDetailDto.cs`, request types under `.../Requests/`

**Resolution:** Documented in `api-contract.md` §10 (GeneratedInvoiceDto block extended with InvoiceDto, PaymentDto, InvoiceDetailDto, business result types).

**Frontend handling:** Admin Invoicing list uses `GET /api/invoices`; detail page filters `GET /api/invoice-details` client-side by `invoiceId`. Payment summary via `GET /api/invoices/{id}/payment-summary`.

---

## Manual invoice create/edit UI

**Status:** Deferred — API confirmed, UI not exposed (2026-06-01)

**Related page/feature:** Admin → Invoicing → manual CRUD

**Problem:** `CreateInvoiceRequest` / `UpdateInvoiceRequest` bodies are confirmed in backend, but primary workflow is generate-from-service-order. Manual header CRUD is not exposed in Admin UI to avoid conflicting with business rules.

**Frontend handling:** Generate, recalculate, issue, cancel, delete (draft only), and record payment are implemented. Manual create/edit forms remain deferred.

---

## Invoice details list filtering

**Status:** Resolved — client-side filter (2026-06-01)

**Related page/feature:** Admin → Invoice detail → line items

**Problem:** `GET /api/invoice-details` returns all details; no `invoiceId` query filter on controller.

**Frontend handling:** Fetch full list and filter by `invoiceId` on the client. Documented here; acceptable per no server pagination policy.

---

## Service order search DTO for Generate Invoice modal

**Status:** Resolved from backend (2026-06-01)

**Related page/feature:** Admin → Invoicing → Generate invoice from service order

**Confirmed in:** `Application/Features/Search/Dtos/ServiceOrderSearchResultDto.cs`, `SearchService.SearchServiceOrdersAsync`

**Searchable backend fields:** `serviceOrderId`, `vehicleId`, `generalDescription` (term min length 2).

**Search limitations:** Client/customer name, VIN, and vehicle model are **not** searchable. Single-digit order or vehicle IDs cannot be matched by ID alone because `term` must be at least 2 characters; use description or a multi-digit ID substring instead.

**Response DTO fields:** `serviceOrderId`, `vehicleId`, `orderStatusId`, `entryDate`, `generalDescription`.

**Not searchable / not returned:** customer/client name, VIN, vehicle model label. UI copy and placeholder use order ID, vehicle ID, and description only.

**Frontend handling:** Modal uses `GET /api/search/service-orders?term=` with normalized input (strips decorative `#`, `Order`, `Vehicle` prefixes), explicit helper/loading/empty/error/result states, and footer validation messages for disabled Generate.

---

## Invoice list paid/pending amounts in search

**Status:** Resolved — not on list DTO (2026-06-01)

**Related page/feature:** Admin → Invoicing list search

**Problem:** Paid and pending amounts are not fields on `InvoiceDto`; they exist only on `GET /api/invoices/{id}/payment-summary`.

**Frontend handling:** List search covers invoice ID, number, service order ID, status, date, subtotal, tax, total, and observations. Placeholder does not mention paid/pending.

---

## Admin Reports — export and charts

**Status:** Deferred — not in backend (2026-06-01)

**Related page/feature:** Admin → Reports

**Problem:** No PDF, Excel, or CSV export endpoints. No chart-specific report payloads.

**Frontend handling:** Summary KPI cards only (StatCard grid). No chart libraries added in Phase 4.7.

---

## Admin Reports — date range validation

**Status:** Resolved from backend (2026-06-01)

**Related page/feature:** Admin → Reports date filter

**Confirmed in:** `ReportService.IsDateRangeValid` — `from` must not be after `to` when both are set.

**Frontend handling:** Invalid ranges return API `{ code, message }`; shown per report panel via `ErrorState`.

---

## Admin Audit — pagination and user display

**Status:** Resolved — client-side (2026-06-01)

**Related page/feature:** Admin → Audit

**Confirmed in:** `GET /api/audits` returns full list (no server pagination). `AuditDto` has `userId` only — no user name or email on audit rows.

**Frontend handling:** Client-side search, action-type filter, and pagination (`useClientPagination`). User column shows `User #id`. Action labels resolved via `GET /api/audit-action-types`.

---

## Admin Audit — recent query limit

**Status:** Resolved from backend (2026-06-01)

**Related page/feature:** Admin → Audit → data source “Recent”

**Confirmed in:** `AuditQueryService.RecentLimit = 50`

**Frontend handling:** Optional data source calls `GET /api/admin/audits/recent`; UI notes the 50-record cap.

---

## Admin Audit — detail by ID

**Status:** Frontend decision (2026-06-01)

**Related page/feature:** Audit detail modal

**Confirmed in:** `GET /api/audits/{id}` exists and matches list row shape.

**Frontend handling:** Detail modal uses the selected row from list/query responses (same fields as `AuditDto`). No extra fetch required for Phase 4.7.

---

## Admin Audit — CRUD writes

**Status:** Deferred for audit UI (2026-06-01)

**Related page/feature:** Admin → Audit

**Problem:** `POST`/`PUT`/`DELETE` on `/api/audits` exist but manual audit creation is not an operational requirement for this phase.

**Frontend handling:** Read-only audit page; no create/edit/delete actions.

---

# Phase 4.8 — Admin Mechanics (2026-06-01)

## No dedicated list-all-mechanics endpoint

**Status:** Resolved — frontend composition (2026-06-01)

**Related page/feature:** Admin → Mechanics (`/admin/mechanics`)

**Problem:** Backend exposes `GET /api/search/mechanics?term=` (min. 2 chars) but no paginated or full roster endpoint.

**Frontend handling:** Roster built client-side from confirmed sources: `GET /api/person-roles` (Mechanic role), `GET /api/persons`, `GET /api/users` (account active flag), `GET /api/mechanic-specialty-assignments`, `GET /api/mechanic-assignments`, and `GET /api/mechanic-specialties` (catalog labels). Quick search uses `GET /api/search/mechanics?term=`. Staff registration remains on `/admin/staff`.

---

## MechanicAssignmentDto / workload detail fields

**Status:** Resolved from backend (2026-06-01)

**Related page/feature:** Admin → Mechanics → workload panel

**Confirmed in:** `MechanicAssignmentDto.cs`, `OrderServiceDto.cs`

**Fields:** Assignments expose `mechanicAssignmentId`, `orderServiceId`, `mechanicPersonId`, `specialtyId`. Service order context resolved via `GET /api/order-services` → `serviceOrderId`. No order status or customer name on assignment rows; link to service order detail for full context.

---

## Mechanic specialties edit on Admin Mechanics page

**Status:** Resolved — enabled (2026-06-01)

**Related page/feature:** Admin → Mechanics → Edit specialties

**Confirmed:** `PUT /api/mechanics/{personId}/specialties` body `{ specialtyIds?: number[] }`; response `MechanicSpecialtySummaryDto[]`.

---

*Last reviewed against backend: 2026-06-02 (Phase 6.4 Mechanic request parts & search parts). Update this file when backend or deployment config changes.*

---

# Phase 6.1 — Mechanic Dashboard & Assigned Services (2026-06-02)

## Mechanic dashboard endpoint confirmed

**Status:** Resolved from backend (2026-06-02)

**Related page/feature:** Mechanic → Dashboard (`/mechanic/dashboard`)

**Confirmed:** `GET /api/mechanic/dashboard` → `MechanicDashboardDto` (assignedServices, activeOrders, pendingWorkReports, requestedPartsPendingApproval, activeServiceOrderIds). Scoped by JWT `personId` claim.

**Frontend handling:** KPI cards bind directly to dashboard DTO; no client-side composition required.

---

## Mechanic assigned services endpoint confirmed

**Status:** Resolved from backend (2026-06-02)

**Related page/feature:** Mechanic → Assigned Services (`/mechanic/assigned-services`)

**Confirmed:** `GET /api/mechanic/my-assigned-services` → `MechanicAssignedServiceDto[]`. Returns only assignments where `mechanicPersonId` matches authenticated mechanic. Safe for Mechanic role — do **not** use `GET /api/mechanic-assignments` (Admin/Receptionist only).

**Frontend handling:** Assigned work board uses this endpoint only.

---

## Vehicle plate not in MechanicAssignedServiceDto

**Status:** Resolved from backend (2026-06-02)

**Related page/feature:** Mechanic assignment cards — vehicle identity label

**Confirmed in:** `Application/Features/ServiceExecution/Dtos/MechanicAssignedServiceDto.cs`, `ServiceExecutionService.GetMyAssignedServicesAsync` — only `vehicleId` is projected; vehicle `Plate` is not included despite plate support elsewhere (vehicles CRUD, search, full-detail).

**Frontend handling:** Show `Vehicle #{vehicleId}` until backend enriches the DTO. Type reserves optional `vehiclePlate` for forward compatibility. Do not call Admin vehicle endpoints to resolve plates from the mechanic portal.

---

## Mechanic assignment metadata gaps

**Status:** Resolved from backend (2026-06-02)

**Related page/feature:** Assignment card fields (assignment ID, assigned date, order status)

**Confirmed missing from `MechanicAssignedServiceDto`:** `mechanicAssignmentId`, assignment/assigned date, parent order status.

**Frontend handling:** Display order service ID, service order ID, specialty, work-performed state, and customer approval only. Order status and assignment date deferred to Phase 6.2 (`my-active-orders`) or future DTO enrichment.

---

## Mechanic active orders page (Phase 6.2)

**Status:** Resolved — implemented (2026-06-02)

**Related page/feature:** `/mechanic/active-orders`

**Endpoint:** `GET /api/mechanic/my-active-orders` → `MechanicActiveOrderDto[]` (mechanic-scoped; excludes completed/cancelled/voided orders server-side).

**DTO fields used in UI:** `serviceOrderId`, `vehicleId`, `orderStatusId`, `entryDate`, `estimatedDeliveryDate`, `generalDescription`.

**Not in DTO (do not invent):** `vehiclePlate`, assigned-service count, pending work-report count, per-service names/descriptions. Vehicle label is `Vehicle #{vehicleId}` until backend adds `vehiclePlate`.

**Cross-navigation:** Active order cards link to Assigned Services (no `orderServiceId` on `MechanicActiveOrderDto`).

---

# Phase 6.3 — Mechanic Service Detail & Record Work (2026-06-02)

## Mechanic service detail data source

**Status:** Resolved — implemented (2026-06-02)

**Related page/feature:** `/mechanic/service-detail/:orderServiceId`

**Confirmed:** No dedicated mechanic GET for a single order service. Detail is built from `GET /api/mechanic/my-assigned-services` by matching `orderServiceId`. Unassigned or unknown IDs show an honest empty state (not Admin full-detail).

---

## Mechanic work report endpoint

**Status:** Resolved — implemented (2026-06-02)

**Related page/feature:** `/mechanic/record-work/:orderServiceId`, work report modal on service detail

**Confirmed:** `PUT /api/mechanic/order-services/{id}/work-performed` with `UpdateWorkPerformedRequest` (`workPerformed` required non-empty; `laborCost` required in model — frontend sends existing assignment `laborCost` unchanged; mechanic UI does not edit labor cost).

**Success:** `ServiceExecutionResultDto`. Refresh assigned services after save.

---

## Mechanic work history

**Status:** Deferred / Not supported by backend yet (unchanged)

**Related page/feature:** `/mechanic/history`

**Resolution:** No list endpoint. Nav item remains `kind: 'deferred'`.

---

# Phase 6.4 — Mechanic Request Parts & Search Parts (2026-06-02)

## Mechanic part search endpoint

**Status:** Resolved from backend (2026-06-02)

**Related page/feature:** `/mechanic/parts/search`

**Confirmed:** `GET /api/search/parts?term=` — roles Admin, Receptionist, Mechanic (`SearchController`). `PartSearchResultDto`: `partId`, `code`, `description`, `stock`, `minimumStock`, `unitPrice`, `isActive`. Term required, min length 2 (`SearchService.ValidateSearchTerm`). Max 20 results.

**Frontend handling:** Read-only search page; no CRUD, stock adjust, or purchase UI. Category/brand not in search DTO — not displayed.

---

## Mechanic request part endpoint

**Status:** Resolved from backend (2026-06-02)

**Related page/feature:** `/mechanic/parts/request`, `/mechanic/parts/request/:orderServiceId`, request modal on service detail

**Confirmed:** `POST /api/order-services/{id}/request-part` — body `{ partId, quantity, appliedUnitPrice }` (`RequestOrderServicePartRequest`). Success: `ServiceExecutionResultDto`. Mechanic must be assigned to the order service unless Admin (`ServiceExecutionService.RequestPartAsync`).

**Frontend handling:** Contextual flow from assigned services / service detail only. Sidebar `/mechanic/parts/request` shows guidance without standalone request. `appliedUnitPrice` defaults from selected part catalog price.

---

## Part category/brand on mechanic search

**Status:** Resolved — not in API (2026-06-02)

**Related page/feature:** Mechanic search result cards

**Confirmed:** `PartSearchResultDto` has no category or brand fields.

**Frontend handling:** Do not display category/brand on mechanic search or request UI.

---

## Mechanic part approval status on assignment DTO

**Status:** Deferred — not on assigned service list (2026-06-02)

**Related page/feature:** Assigned services after part request

**Problem:** `MechanicAssignedServiceDto` does not include requested parts or approval state. No mechanic-scoped GET for order service parts.

**Frontend handling:** Show success message after request; do not fabricate approval badges on assignment cards until backend enriches DTO or exposes a mechanic-safe parts list.
