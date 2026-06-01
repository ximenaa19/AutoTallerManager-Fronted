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
- **Read-only** (GET list/display only; no create/edit/delete UI) for catalogs whose response or request shapes are not documented in §10 prose: document-types (`code` + `name`), email-domains (`domain`), vehicle-brands (`brandName`), vehicle-models (`brandId`, `modelName`), countries (`phoneCode`), departments, cities, neighborhoods (FK hierarchy).

**Decision needed:** Add explicit `Create*/Update*` JSON field tables to `api-contract.md` §10 for read-only catalogs so the generic catalog form can enable writes safely.

---

## Catalog list response field names vs CatalogItemDto

**Status:** Resolved for frontend implementation (admin CRUD uses entity DTOs, not aggregated catalogs)

**Related page/feature:** Admin catalog detail tables

**Note:** `GET /api/catalogs/public-registration` and `GET /api/catalogs/workshop` return `CatalogItemDto` (`id`, `name`). Admin CRUD endpoints return entity-specific DTOs with typed primary keys (e.g. `genderId`, `specialtyId`, `brandId`). The admin catalogs module uses entity DTO field names from the CRUD index and `MechanicSpecialtyDto`; validate against live API during QA.

---

# Phase 4.3 — Admin Customers and Vehicles (2026-05-31)

## POST /api/clients/{personId}/vehicles request body

**Status:** Deferred — read-only add-vehicle UI disabled

**Related page/feature:** Admin → Customers detail → Add vehicle

**Problem:** `api-contract.md` §9 lists the route and auth but does not document the JSON request body for adding a vehicle to an existing client.

**Frontend handling:** Customer detail shows linked vehicles via GET `/api/clients/{personId}/vehicles` only. Add-vehicle action is not exposed until `Create*` request fields are added to §10.

---

## Vehicle create/update request bodies (POST/PUT /api/vehicles)

**Status:** Deferred — create/edit disabled on Admin Vehicles

**Related page/feature:** Admin → Vehicles list/detail

**Problem:** §9 names `CreateVehicleRequest` / `UpdateVehicleRequest` but §10 does not document JSON field lists (unlike POST `/api/persons`).

**Frontend handling:** List, detail, delete, and transfer ownership are implemented. “New vehicle” and edit forms remain disabled with deferred messaging. `VehicleDto` display fields are typed from §7 domain model + §10 search/client DTOs; validate `createdAt` against live API during QA.

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

**Status:** Deferred — add/edit/delete order service lines disabled

**Related page/feature:** Admin → Service order detail → Services panel

**Problem:** §9 lists CRUD routes and type names for `/api/order-services`, but §10 does not document `OrderServiceDto` field lists or create/update JSON bodies.

**Frontend handling:** Services are displayed read-only from `ServiceOrderFullDetailDto.services`. Confirmed actions remain enabled: assign/unassign mechanic, work report (`PUT /api/order-services/{id}/work-report`), request part. POST/PUT/DELETE on `/api/order-services` are not called from the UI.

---

## OrderStatusHistoryDto

**Status:** Deferred — status history panel not wired

**Related page/feature:** Admin → Service order detail → Status history

**Problem:** GET `/api/order-status-histories` is listed in §9, but §10 does not document `OrderStatusHistoryDto` response fields (e.g. `serviceOrderId`, status transition, observation, timestamp).

**Frontend handling:** Detail page shows a deferred placeholder. Do not fetch or render history rows until DTO fields are added to `api-contract.md` §10.

---

## CreateServiceOrderRequest / UpdateServiceOrderRequest (direct CRUD)

**Status:** Deferred — direct POST/PUT on `/api/service-orders` not used

**Related page/feature:** Admin → Service orders

**Problem:** §9 names create/update request types for `/api/service-orders`, but §10 documents only `ServiceOrderDto` response fields, not create/update JSON bodies.

**Frontend handling:** New orders use the fully documented workshop intake flow (`POST /api/workshop-intake/create-service-order` with `CreateWorkshopIntakeRequest`). Direct service-order CRUD is not exposed.

---

*Last reviewed against backend: 2026-05-29. Update this file when backend or deployment config changes.*
