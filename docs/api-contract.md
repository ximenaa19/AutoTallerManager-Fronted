# AutoTallerManager API Contract

> **Document review:** 2026-06-03 (Admin sync). Admin mechanics aggregate endpoints, invoice details by `invoiceId`, purchase cancel/reverse, audit read-only API, and vehicle plate contract re-verified against `AutoTallerManager-Backend` `main` (commit `ade98b70`).

## 1. Purpose of This Document

This document is the **frontend source of truth** for building the AutoTallerManager UI and API integrations. It was generated from the backend source code in `AutoTallerManager-Backend` and is intended to let frontend developers implement pages, services, hooks, and types **without direct access to the backend repository**.

---

## 2. Backend Summary

| Item | Value |
|------|-------|
| **Project name** | AutoTallerManager |
| **Backend framework** | ASP.NET Core (Web API) |
| **Architecture style** | Clean / hexagonal-style layered architecture |
| **Main layers** | Api, Application, Domain, Infrastructure |
| **Database provider** | MySQL (Pomelo EF Core - `UseMySql` in `Api/Program.cs`) |
| **Authentication** | JWT Bearer tokens + refresh tokens stored on `User` entity |
| **Main business domain** | Auto repair workshop management (clients, vehicles, service orders, mechanics, inventory, invoicing, payments, approvals, reporting) |

---

## 3. Architecture Overview

### Layer responsibilities

| Layer | Role |
|-------|------|
| **Api** | HTTP controllers, JWT/CORS/Swagger configuration, maps HTTP to application services |
| **Application** | Feature services, DTOs, request models, validation, business use cases, `Result<T>` error handling |
| **Domain** | Entity definitions and relationships |
| **Infrastructure** | EF Core `AppDbContext`, repositories, unit of work, migrations, seed data |

### Simplified folder tree

```
AutoTallerManager-Backend/
├── Api/
│   ├── Controllers/          # 67 controllers, 303 endpoints
│   ├── Security/             # JwtOptions, JwtTokenGenerator, AuthTokenSettings
│   ├── Program.cs
│   ├── appsettings.json
│   └── Properties/launchSettings.json
├── Application/
│   ├── Common/               # Result, Pagination, Security interfaces
│   └── Features/             # One folder per module (Auth, ServiceOrders, ...)
├── Domain/
│   └── Entities/             # 46 entities
├── Infrastructure/
│   ├── Persistence/          # DbContext, configs, migrations, seeders
│   └── DependencyInjection.cs
└── tools/e2e/                # PowerShell E2E test runner
```

---

## 4. Frontend Integration Assumptions

| Setting | Value |
|---------|-------|
| **Base API URL (dev HTTP)** | `http://localhost:5077` |
| **Base API URL (dev HTTPS)** | `https://localhost:7072` |
| **Authentication required** | Yes, for nearly all endpoints except auth and public catalog |
| **Content-Type** | `application/json` for request/response bodies |
| **Auth header** | `Authorization: Bearer {accessToken}` (ASP.NET JWT Bearer standard) |
| **Token storage** | Store `accessToken` and `refreshToken` securely; refresh before expiry |

### CORS (from `Api/Program.cs`)

Allowed origins in development:

- `http://localhost:3000` (Next.js default)
- `http://localhost:5173` (Vite default)
- `http://localhost:4200` (Angular default)

Policy: `AllowAnyHeader`, `AllowAnyMethod`.

### Environment variables (suggested)

```env
# Vite / React
VITE_API_BASE_URL=http://localhost:5077

# Next.js
NEXT_PUBLIC_API_BASE_URL=http://localhost:5077
```

### Swagger note

Swagger UI is enabled in Development (`/swagger`). The OpenAPI security scheme description says *"Enter JWT token only. Do not write Bearer."* (`Api/Program.cs`). That text is **misleading for API clients**.

### Authorization header (confirmed)

The API uses `Microsoft.AspNetCore.Authentication.JwtBearer` with default `JwtBearerHandler` (`Api/Program.cs`). Clients **must** send:

```http
Authorization: Bearer {accessToken}
```

Swagger UI may accept the raw token in its authorize dialog; programmatic clients (fetch, axios) must include the `Bearer` prefix.

### Local development base URL (confirmed)

| Profile | URL | Source |
|---------|-----|--------|
| **Recommended for SPA** | `http://localhost:5077` | `Api/Properties/launchSettings.json` → profile `http` |
| HTTPS also available | `https://localhost:7072` | profile `https` (also binds `http://localhost:5077`) |

`app.UseHttpsRedirection()` is enabled (`Api/Program.cs`). If the SPA is served over **HTTP** (e.g. Vite on `http://localhost:5173`), call the API on **`http://localhost:5077`** to avoid mixed-content and redirect issues. E2E tests in `tools/e2e/` use `http://localhost:5077`.

---

## 5. Authentication and Authorization

### Auth endpoints

| Method | Route | Auth | Description | Source |
|--------|-------|------|-------------|--------|
| POST | `/api/auth/register-client` | Public | Self-registration for clients | `Api/Controllers/AuthController.cs` |
| POST | `/api/auth/login` | Public | Login with email/password | `Api/Controllers/AuthController.cs` |
| POST | `/api/auth/refresh` | Public | Rotate access + refresh tokens | `Api/Controllers/AuthController.cs` |
| POST | `/api/auth/logout` | Public | Invalidate refresh token | `Api/Controllers/AuthController.cs` |

### Login flow

1. `POST /api/auth/login` with `{ email, password }`.
2. Receive `AuthResponseDto` with tokens, expiry timestamps, and `user` (userId, personId, email, isActive, roles).
3. Attach `Authorization: Bearer {accessToken}` to subsequent requests.
4. On 401 or before expiry, call `POST /api/auth/refresh` with `{ refreshToken }`.
5. On logout, call `POST /api/auth/logout` with `{ refreshToken }` and clear local tokens.

### Register flow (client self-service)

1. Load catalogs via `GET /api/catalogs/public-registration` (no auth).
2. Optionally use existing `addressId` or create address through staff flows.
3. `POST /api/auth/register-client` with person + email + password (+ optional phone).
4. User is created with **Client** role and tokens are returned (auto-login).

### Token response shape (`AuthResponseDto`)

```json
{
  "accessToken": "eyJ...",
  "accessTokenExpiresAt": "2026-05-29T12:00:00Z",
  "refreshToken": "...",
  "refreshTokenExpiresAt": "2026-06-05T12:00:00Z",
  "user": {
    "userId": 1,
    "personId": 1,
    "email": "user@example.com",
    "isActive": true,
    "roles": ["Client"]
  }
}
```

### JWT claims (from `Api/Security/JwtTokenGenerator.cs`)

| Claim | Description |
|-------|-------------|
| `sub` | User ID (string) |
| `userId` | User ID |
| `personId` | Person ID (used for client/mechanic scoped endpoints) |
| `email` | User email |
| `role` (`ClaimTypes.Role`) | One claim per active role |

### Token configuration (`appsettings.json`)

| Setting | Default |
|---------|---------|
| Issuer | `AutoTallerManager` |
| Audience | `AutoTallerManager.Client` |
| Access token expiry | 60 minutes |
| Refresh token expiry | 7 days |

### Roles (seeded in `Infrastructure/Persistence/Seeders/ModelBuilderSeeder.cs`)

| RoleId | RoleName | Typical use |
|--------|----------|-------------|
| 1 | Admin | Full system administration |
| 2 | Client | Own vehicles, orders, invoices, approvals |
| 3 | Mechanic | Assigned services, work reports, part requests |
| 4 | Receptionist | Workshop operations, intake, clients, payments |

Staff registration (`POST /api/staff/register`) allows: **Admin**, **Receptionist**, **Mechanic** only (not Client).

### Public routes

- `POST /api/auth/register-client`, `/login`, `/refresh`, `/logout`
- `GET /api/catalogs/public-registration` (`[AllowAnonymous]` overrides controller auth)

### Protected routes

All other endpoints require a valid JWT. Role restrictions are enforced per controller/action (see Section 8).

### Dev bootstrap admin (Development only)

From `Api/appsettings.Development.json`:

- Email: `admin.autotaller@test.com`
- Password: `Admin123*`

---

## 6. Global API Behavior

### Common success responses

| Pattern | HTTP status | Body |
|---------|-------------|------|
| Single resource | 200 | DTO object |
| Collection | 200 | JSON array of DTOs |
| Create | 201 | Created DTO (+ `Location` via `CreatedAtAction`) |
| Delete / some actions | 204 | No body |

There is **no global response wrapper**. Successful responses return DTOs directly.

### Error format (`Api/Controllers/BaseApiController.cs`)

```json
{
  "code": "ErrorCodeSuffix",
  "message": "Human-readable message"
}
```

### Error code -> HTTP status mapping

| HTTP | When | Error code suffix examples |
|------|------|---------------------------|
| 400 | Validation / invalid input | `Required`, `TooShort`, `TooLong`, `Invalid`, `Validation`, `Expired`, `InvalidCredentials` |
| 404 | Not found | `NotFound` |
| 409 | Conflict | `AlreadyExists`, `InUse`, `Conflict` |
| 500 | Other failures | Anything else |
| 401 | Missing/invalid JWT | ASP.NET auth middleware (typically empty or non-JSON body) |
| 403 | Wrong role | ASP.NET authorization (typically empty or non-JSON body) |

### Validation errors

Returned as 400 with `{ code, message }`. **No field-level validation array** is exposed by the API layer (`BaseApiController` maps `Result` failures to a single error object).

**Frontend:** Mirror validation rules from request/DTO documentation and Application service error definitions under `Application/Features/*/Errors/`. Map known `code` suffixes (`Required`, `TooLong`, `Invalid`, etc.) to form fields where practical.

### Date format

ISO 8601 `DateTime` strings in JSON (UTC for server-generated timestamps). Example: `"2026-05-29T14:30:00Z"`.

### ID conventions

- Primary keys are **`int`** (`PersonId`, `ServiceOrderId`, etc.).
- Route parameters use `{id:int}` constraint (documented as `{id}`).

### Naming conventions

- JSON uses **camelCase** (ASP.NET Core default serialization).
- Routes use **kebab-case** (`/api/service-orders`, `/api/order-service-parts`).

### Pagination

`PaginationRequest` and `PagedResult<T>` exist in `Application/Common/Pagination/` but are **not referenced by any controller or application service** (verified in backend source). All list endpoints return **full JSON arrays**.

**Frontend:** Use client-side filter, sort, and optional virtual scroll. Do not send `page`/`pageSize` query params unless a future API version documents them.

### Filtering / sorting

| Area | Behavior (confirmed) |
|------|----------------------|
| CRUD `GET /api/{resource}` | No query filters; returns all rows |
| Search `GET /api/search/*` | Required query param `term` only |
| Reports `GET /api/admin/reports/*` | Optional `from`, `to` (`DateTime?`) |
| Dashboards `GET /api/*/dashboard` | **No** query parameters |
| Inventory `GET /api/inventory/low-stock` | No filters (pre-filtered server-side) |

No standard `sortBy` / `order` query params on list endpoints.

---

## 7. Domain Model Summary

Below are the main entities. Full definitions are in `Domain/Entities/`.

### Person

Represents a natural person (client, staff, mechanic).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| PersonId | int | Yes | PK |
| DocumentTypeId | int | Yes | FK -> DocumentType |
| DocumentNumber | string | Yes | Unique |
| FirstName, LastName | string | Yes | Max 50 chars |
| MiddleName, SecondLastName | string | No | Max 50 chars |
| BirthDate | DateTime? | No | Cannot be future |
| GenderId | int? | No | FK -> Gender |
| AddressId | int? | No | FK -> Address |
| CreatedAt | DateTime | Yes | Auto |

**Relationships:** User (0..1), PersonEmails, PersonPhones, PersonRoles, VehicleOwnerHistories, MechanicSpecialtyAssignments.

### User

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| UserId | int | Yes | PK |
| PersonId | int | Yes | FK -> Person |
| PasswordHash | string | Yes | PBKDF2 hashed |
| RefreshToken | string? | No | Rotated on login/refresh |
| RefreshTokenExpiration | DateTime? | No | |
| IsActive | bool | Yes | Inactive users cannot login |
| CreatedAt | DateTime | Yes | |

### Vehicle

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| VehicleId | int | Yes | PK |
| ModelId | int | Yes | FK -> VehicleModel |
| VehicleTypeId | int | Yes | FK -> VehicleType |
| VIN | string | Yes | |
| Year | int | Yes | |
| Color | string? | No | |
| Mileage | int | Yes | |
| IsActive | bool | Yes | |

Ownership tracked via **VehicleOwnerHistory** (PersonId + StartDate/EndDate).

### ServiceOrder

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| ServiceOrderId | int | Yes | PK |
| VehicleId | int | Yes | FK |
| OrderStatusId | int | Yes | FK -> OrderStatus |
| EntryDate | DateTime | Yes | |
| EstimatedDeliveryDate | DateTime? | No | |
| GeneralDescription | string? | No | |
| CancellationReason | string? | No | Set on cancel/void |
| CancellationDate | DateTime? | No | |
| CreatedAt | DateTime | Yes | |

**Relationships:** OrderServices, OrderStatusHistories, VehicleEntryInventory, Invoice.

### OrderService / OrderServicePart

Line items on a service order. Both support **customer approval** (`CustomerApproved`, `ApprovalDate`).

### Invoice / Payment

Invoice linked to ServiceOrder via `ServiceOrderId`. Payments linked to Invoice. Whether only one invoice per service order is allowed is enforced in application logic; no obvious unique constraint is visible on the `Invoice` entity alone. Card details via PaymentCard when method is Card.

### Seeded lookup values (reference IDs for UI)

**OrderStatus:** 1=Pending, 2=InProgress, 3=Completed, 4=Cancelled, 5=Voided

**InvoiceStatus:** 1=Draft, 2=Issued, 3=Paid, 4=Cancelled

**PaymentStatus:** 1=Pending, 2=Completed, 3=Refunded, 4=Failed

**PaymentMethod:** 1=Cash, 2=Card, 3=BankTransfer

**Roles:** 1=Admin, 2=Client, 3=Mechanic, 4=Receptionist

See `Infrastructure/Persistence/Seeders/ModelBuilderSeeder.cs` for full seed lists (service types, part categories, vehicle types, document types, etc.).

---

## 8. API Endpoints Summary

Total documented endpoints: **303**

| Module | Method | Route | Auth | Description | Source |
|--------|--------|-------|------|-------------|--------|
| Account | GET | `/api/account/me` | Authenticated | Get current profile | `Api/Controllers/AccountController.cs` |
| Account | PUT | `/api/account/me` | Authenticated | Update current profile | `Api/Controllers/AccountController.cs` |
| Account | POST | `/api/account/change-password` | Authenticated | Change password | `Api/Controllers/AccountController.cs` |
| Addresses | GET | `/api/addresses` | Admin,Receptionist | List all | `Api/Controllers/AddressesController.cs` |
| Addresses | GET | `/api/addresses/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/AddressesController.cs` |
| Addresses | POST | `/api/addresses` | Admin,Receptionist | Create | `Api/Controllers/AddressesController.cs` |
| Addresses | PUT | `/api/addresses/{id}` | Admin,Receptionist | Update | `Api/Controllers/AddressesController.cs` |
| Addresses | DELETE | `/api/addresses/{id}` | Admin,Receptionist | Delete | `Api/Controllers/AddressesController.cs` |
| Admin Audits | GET | `/api/admin/audits/recent` | Admin | List all | `Api/Controllers/AdminAuditQueriesController.cs` |
| Admin Audits | GET | `/api/admin/audits/by-entity` | Admin | List all | `Api/Controllers/AdminAuditQueriesController.cs` |
| Admin Audits | GET | `/api/admin/audits/by-user/{userId}` | Admin | Get by ID | `Api/Controllers/AdminAuditQueriesController.cs` |
| Admin Mechanics | GET | `/api/admin/mechanics` | Admin | List all mechanics (aggregate) | `Api/Controllers/AdminMechanicsController.cs` |
| Admin Mechanics | GET | `/api/admin/mechanics/{personId}` | Admin | Mechanic detail (aggregate) | `Api/Controllers/AdminMechanicsController.cs` |
| Admin Mechanics | GET | `/api/admin/mechanics/{personId}/workload` | Admin | Mechanic workload | `Api/Controllers/AdminMechanicsController.cs` |
| AuditActionTypes | GET | `/api/audit-action-types` | Admin | List all (read-only) | `Api/Controllers/AuditActionTypesController.cs` |
| AuditActionTypes | GET | `/api/audit-action-types/{id}` | Admin | Get by ID (read-only) | `Api/Controllers/AuditActionTypesController.cs` |
| Audits | GET | `/api/audits` | Admin | List all (read-only) | `Api/Controllers/AuditsController.cs` |
| Audits | GET | `/api/audits/{id}` | Admin | Get by ID (read-only) | `Api/Controllers/AuditsController.cs` |
| Auth | POST | `/api/auth/register-client` | Public | Business action | `Api/Controllers/AuthController.cs` |
| Auth | POST | `/api/auth/login` | Public | Business action | `Api/Controllers/AuthController.cs` |
| Auth | POST | `/api/auth/refresh` | Public | Business action | `Api/Controllers/AuthController.cs` |
| Auth | POST | `/api/auth/logout` | Public | Business action | `Api/Controllers/AuthController.cs` |
| CardTypes | GET | `/api/card-types` | Admin | List all | `Api/Controllers/CardTypesController.cs` |
| CardTypes | GET | `/api/card-types/{id}` | Admin | Get by ID | `Api/Controllers/CardTypesController.cs` |
| CardTypes | POST | `/api/card-types` | Admin | Create | `Api/Controllers/CardTypesController.cs` |
| CardTypes | PUT | `/api/card-types/{id}` | Admin | Update | `Api/Controllers/CardTypesController.cs` |
| CardTypes | DELETE | `/api/card-types/{id}` | Admin | Delete | `Api/Controllers/CardTypesController.cs` |
| Catalogs | GET | `/api/catalogs/public-registration` | Public | List all | `Api/Controllers/CatalogsController.cs` |
| Catalogs | GET | `/api/catalogs/workshop` | Admin,Receptionist,Mechanic | List all | `Api/Controllers/CatalogsController.cs` |
| Cities | GET | `/api/cities` | Admin | List all | `Api/Controllers/CitiesController.cs` |
| Cities | GET | `/api/cities/{id}` | Admin | Get by ID | `Api/Controllers/CitiesController.cs` |
| Cities | POST | `/api/cities` | Admin | Create | `Api/Controllers/CitiesController.cs` |
| Cities | PUT | `/api/cities/{id}` | Admin | Update | `Api/Controllers/CitiesController.cs` |
| Cities | DELETE | `/api/cities/{id}` | Admin | Delete | `Api/Controllers/CitiesController.cs` |
| Client Approvals | GET | `/api/client/pending-approvals` | Client | List all | `Api/Controllers/ClientApprovalsController.cs` |
| Client Approvals | POST | `/api/client/approvals/order-services/{id}/approve` | Client | Business action | `Api/Controllers/ClientApprovalsController.cs` |
| Client Approvals | POST | `/api/client/approvals/order-services/{id}/reject` | Client | Business action | `Api/Controllers/ClientApprovalsController.cs` |
| Client Approvals | POST | `/api/client/approvals/order-service-parts/{id}/approve` | Client | Business action | `Api/Controllers/ClientApprovalsController.cs` |
| Client Approvals | POST | `/api/client/approvals/order-service-parts/{id}/reject` | Client | Business action | `Api/Controllers/ClientApprovalsController.cs` |
| Client Vehicles | POST | `/api/clients/{personId}/vehicles` | Admin,Receptionist | Business action | `Api/Controllers/ClientVehiclesController.cs` |
| Client Vehicles | POST | `/api/vehicles/{vehicleId}/transfer-ownership` | Admin,Receptionist | Business action | `Api/Controllers/ClientVehiclesController.cs` |
| Client Vehicles | GET | `/api/clients/{personId}/vehicles` | Admin,Receptionist | Business action | `Api/Controllers/ClientVehiclesController.cs` |
| Client Vehicles | GET | `/api/clients/{personId}/service-orders` | Admin,Receptionist | Business action | `Api/Controllers/ClientVehiclesController.cs` |
| Client Vehicles | GET | `/api/client/my-vehicles` | Client | List own vehicles | `Api/Controllers/ClientVehiclesController.cs` |
| Client Vehicles | GET | `/api/client/my-service-orders` | Client | List own service orders | `Api/Controllers/ClientVehiclesController.cs` |
| Client Vehicles | GET | `/api/client/my-invoices` | Client | List own invoices | `Api/Controllers/ClientVehiclesController.cs` |
| Countries | GET | `/api/countries` | Admin | List all | `Api/Controllers/CountriesController.cs` |
| Countries | GET | `/api/countries/{id}` | Admin | Get by ID | `Api/Controllers/CountriesController.cs` |
| Countries | POST | `/api/countries` | Admin | Create | `Api/Controllers/CountriesController.cs` |
| Countries | PUT | `/api/countries/{id}` | Admin | Update | `Api/Controllers/CountriesController.cs` |
| Countries | DELETE | `/api/countries/{id}` | Admin | Delete | `Api/Controllers/CountriesController.cs` |
| Dashboards | GET | `/api/client/dashboard` | Client | Client dashboard | `Api/Controllers/DashboardsController.cs` |
| Dashboards | GET | `/api/mechanic/dashboard` | Mechanic | Mechanic dashboard | `Api/Controllers/DashboardsController.cs` |
| Dashboards | GET | `/api/receptionist/dashboard` | Receptionist | Receptionist dashboard | `Api/Controllers/DashboardsController.cs` |
| Dashboards | GET | `/api/admin/dashboard` | Admin | Admin dashboard | `Api/Controllers/DashboardsController.cs` |
| Departments | GET | `/api/departments` | Admin | List all | `Api/Controllers/DepartmentsController.cs` |
| Departments | GET | `/api/departments/{id}` | Admin | Get by ID | `Api/Controllers/DepartmentsController.cs` |
| Departments | POST | `/api/departments` | Admin | Create | `Api/Controllers/DepartmentsController.cs` |
| Departments | PUT | `/api/departments/{id}` | Admin | Update | `Api/Controllers/DepartmentsController.cs` |
| Departments | DELETE | `/api/departments/{id}` | Admin | Delete | `Api/Controllers/DepartmentsController.cs` |
| DocumentTypes | GET | `/api/document-types` | Admin | List all | `Api/Controllers/DocumentTypesController.cs` |
| DocumentTypes | GET | `/api/document-types/{id}` | Admin | Get by ID | `Api/Controllers/DocumentTypesController.cs` |
| DocumentTypes | POST | `/api/document-types` | Admin | Create | `Api/Controllers/DocumentTypesController.cs` |
| DocumentTypes | PUT | `/api/document-types/{id}` | Admin | Update | `Api/Controllers/DocumentTypesController.cs` |
| DocumentTypes | DELETE | `/api/document-types/{id}` | Admin | Delete | `Api/Controllers/DocumentTypesController.cs` |
| EmailDomains | GET | `/api/email-domains` | Admin | List all | `Api/Controllers/EmailDomainsController.cs` |
| EmailDomains | GET | `/api/email-domains/{id}` | Admin | Get by ID | `Api/Controllers/EmailDomainsController.cs` |
| EmailDomains | POST | `/api/email-domains` | Admin | Create | `Api/Controllers/EmailDomainsController.cs` |
| EmailDomains | PUT | `/api/email-domains/{id}` | Admin | Update | `Api/Controllers/EmailDomainsController.cs` |
| EmailDomains | DELETE | `/api/email-domains/{id}` | Admin | Delete | `Api/Controllers/EmailDomainsController.cs` |
| Genders | GET | `/api/genders` | Admin | List all | `Api/Controllers/GendersController.cs` |
| Genders | GET | `/api/genders/{id}` | Admin | Get by ID | `Api/Controllers/GendersController.cs` |
| Genders | POST | `/api/genders` | Admin | Create | `Api/Controllers/GendersController.cs` |
| Genders | PUT | `/api/genders/{id}` | Admin | Update | `Api/Controllers/GendersController.cs` |
| Genders | DELETE | `/api/genders/{id}` | Admin | Delete | `Api/Controllers/GendersController.cs` |
| Inventory Business | POST | `/api/inventory/register-purchase` | Admin,Receptionist | Create | `Api/Controllers/InventoryBusinessController.cs` |
| Inventory Business | GET | `/api/inventory/low-stock` | Admin,Receptionist | List all | `Api/Controllers/InventoryBusinessController.cs` |
| Inventory Business | POST | `/api/inventory/adjust-stock` | Admin | Adjust part stock | `Api/Controllers/InventoryBusinessController.cs` |
| Inventory Business | GET | `/api/inventory/summary` | Admin,Receptionist | Inventory summary | `Api/Controllers/InventoryBusinessController.cs` |
| Inventory Business | POST | `/api/inventory/purchases/{purchaseId}/cancel` | Admin | Cancel purchase (revert stock) | `Api/Controllers/InventoryBusinessController.cs` |
| Invoice Business | POST | `/api/invoices/generate-from-service-order/{serviceOrderId}` | Admin,Receptionist | Action | `Api/Controllers/InvoiceBusinessController.cs` |
| Invoice Business | POST | `/api/invoices/{id}/recalculate` | Admin,Receptionist | Business action | `Api/Controllers/InvoiceBusinessController.cs` |
| Invoice Business | POST | `/api/invoices/{id}/issue` | Admin,Receptionist | Business action | `Api/Controllers/InvoiceBusinessController.cs` |
| Invoice Business | POST | `/api/invoices/{id}/cancel` | Admin | Business action | `Api/Controllers/InvoiceBusinessController.cs` |
| InvoiceDetails | GET | `/api/invoice-details` | Admin,Receptionist | List all | `Api/Controllers/InvoiceDetailsController.cs` |
| InvoiceDetails | GET | `/api/invoice-details/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/InvoiceDetailsController.cs` |
| InvoiceDetails | POST | `/api/invoice-details` | Admin,Receptionist | Create | `Api/Controllers/InvoiceDetailsController.cs` |
| InvoiceDetails | PUT | `/api/invoice-details/{id}` | Admin,Receptionist | Update | `Api/Controllers/InvoiceDetailsController.cs` |
| InvoiceDetails | DELETE | `/api/invoice-details/{id}` | Admin,Receptionist | Delete | `Api/Controllers/InvoiceDetailsController.cs` |
| Invoices | GET | `/api/invoices` | Admin,Receptionist | List all | `Api/Controllers/InvoicesController.cs` |
| Invoices | GET | `/api/invoices/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/InvoicesController.cs` |
| Invoices | GET | `/api/invoices/{invoiceId}/details` | Admin,Receptionist | Invoice line items by invoice | `Api/Controllers/InvoicesController.cs` |
| Invoices | POST | `/api/invoices` | Admin,Receptionist | Create | `Api/Controllers/InvoicesController.cs` |
| Invoices | PUT | `/api/invoices/{id}` | Admin,Receptionist | Update | `Api/Controllers/InvoicesController.cs` |
| Invoices | DELETE | `/api/invoices/{id}` | Admin,Receptionist | Delete | `Api/Controllers/InvoicesController.cs` |
| InvoiceStatuses | GET | `/api/invoice-statuses` | Admin | List all | `Api/Controllers/InvoiceStatusesController.cs` |
| InvoiceStatuses | GET | `/api/invoice-statuses/{id}` | Admin | Get by ID | `Api/Controllers/InvoiceStatusesController.cs` |
| InvoiceStatuses | POST | `/api/invoice-statuses` | Admin | Create | `Api/Controllers/InvoiceStatusesController.cs` |
| InvoiceStatuses | PUT | `/api/invoice-statuses/{id}` | Admin | Update | `Api/Controllers/InvoiceStatusesController.cs` |
| InvoiceStatuses | DELETE | `/api/invoice-statuses/{id}` | Admin | Delete | `Api/Controllers/InvoiceStatusesController.cs` |
| MechanicAssignments | GET | `/api/mechanic-assignments` | Admin,Receptionist | List all | `Api/Controllers/MechanicAssignmentsController.cs` |
| MechanicAssignments | GET | `/api/mechanic-assignments/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/MechanicAssignmentsController.cs` |
| MechanicAssignments | POST | `/api/mechanic-assignments` | Admin,Receptionist | Create | `Api/Controllers/MechanicAssignmentsController.cs` |
| MechanicAssignments | PUT | `/api/mechanic-assignments/{id}` | Admin,Receptionist | Update | `Api/Controllers/MechanicAssignmentsController.cs` |
| MechanicAssignments | DELETE | `/api/mechanic-assignments/{id}` | Admin,Receptionist | Delete | `Api/Controllers/MechanicAssignmentsController.cs` |
| Mechanics | GET | `/api/mechanics/{personId}/specialties` | Admin,Receptionist | Business action | `Api/Controllers/MechanicsController.cs` |
| Mechanics | PUT | `/api/mechanics/{personId}/specialties` | Admin | Business action | `Api/Controllers/MechanicsController.cs` |
| MechanicSpecialties | GET | `/api/mechanic-specialties` | Admin | List all | `Api/Controllers/MechanicSpecialtiesController.cs` |
| MechanicSpecialties | GET | `/api/mechanic-specialties/{id}` | Admin | Get by ID | `Api/Controllers/MechanicSpecialtiesController.cs` |
| MechanicSpecialties | POST | `/api/mechanic-specialties` | Admin | Create | `Api/Controllers/MechanicSpecialtiesController.cs` |
| MechanicSpecialties | PUT | `/api/mechanic-specialties/{id}` | Admin | Update | `Api/Controllers/MechanicSpecialtiesController.cs` |
| MechanicSpecialties | DELETE | `/api/mechanic-specialties/{id}` | Admin | Delete | `Api/Controllers/MechanicSpecialtiesController.cs` |
| MechanicSpecialtyAssignments | GET | `/api/mechanic-specialty-assignments` | Admin,Receptionist | List all | `Api/Controllers/MechanicSpecialtyAssignmentsController.cs` |
| MechanicSpecialtyAssignments | GET | `/api/mechanic-specialty-assignments/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/MechanicSpecialtyAssignmentsController.cs` |
| MechanicSpecialtyAssignments | POST | `/api/mechanic-specialty-assignments` | Admin,Receptionist | Create | `Api/Controllers/MechanicSpecialtyAssignmentsController.cs` |
| MechanicSpecialtyAssignments | PUT | `/api/mechanic-specialty-assignments/{id}` | Admin,Receptionist | Update | `Api/Controllers/MechanicSpecialtyAssignmentsController.cs` |
| MechanicSpecialtyAssignments | DELETE | `/api/mechanic-specialty-assignments/{id}` | Admin,Receptionist | Delete | `Api/Controllers/MechanicSpecialtyAssignmentsController.cs` |
| Mechanic Workflow | GET | `/api/mechanic/my-assigned-services` | Mechanic | List all | `Api/Controllers/MechanicWorkflowController.cs` |
| Mechanic Workflow | GET | `/api/mechanic/my-active-orders` | Mechanic | List all | `Api/Controllers/MechanicWorkflowController.cs` |
| Mechanic Workflow | PUT | `/api/mechanic/order-services/{id}/work-performed` | Mechanic — body: `UpdateWorkPerformedRequest` | Business action | `Api/Controllers/MechanicWorkflowController.cs` |
| Neighborhoods | GET | `/api/neighborhoods` | Admin | List all | `Api/Controllers/NeighborhoodsController.cs` |
| Neighborhoods | GET | `/api/neighborhoods/{id}` | Admin | Get by ID | `Api/Controllers/NeighborhoodsController.cs` |
| Neighborhoods | POST | `/api/neighborhoods` | Admin | Create | `Api/Controllers/NeighborhoodsController.cs` |
| Neighborhoods | PUT | `/api/neighborhoods/{id}` | Admin | Update | `Api/Controllers/NeighborhoodsController.cs` |
| Neighborhoods | DELETE | `/api/neighborhoods/{id}` | Admin | Delete | `Api/Controllers/NeighborhoodsController.cs` |
| Order Service Business | PUT | `/api/order-services/{id}/work-report` | Admin,Receptionist,Mechanic | Business action | `Api/Controllers/OrderServiceBusinessController.cs` |
| Order Service Business | POST | `/api/order-services/{id}/assign-mechanic` | Admin,Receptionist | Business action | `Api/Controllers/OrderServiceBusinessController.cs` |
| Order Service Business | POST | `/api/order-services/{id}/unassign-mechanic` | Admin,Receptionist | Business action | `Api/Controllers/OrderServiceBusinessController.cs` |
| Order Service Business | POST | `/api/order-services/{id}/request-part` | Admin,Receptionist,Mechanic | Business action | `Api/Controllers/OrderServiceBusinessController.cs` |
| Order Service Part Business | POST | `/api/order-service-parts/{id}/approve` | Admin,Receptionist | Business action | `Api/Controllers/OrderServicePartBusinessController.cs` |
| Order Service Part Business | POST | `/api/order-service-parts/{id}/reject` | Admin,Receptionist | Business action | `Api/Controllers/OrderServicePartBusinessController.cs` |
| Order Service Part Business | PUT | `/api/order-service-parts/{id}/change-quantity` | Admin,Receptionist,Mechanic | Business action | `Api/Controllers/OrderServicePartBusinessController.cs` |
| OrderServiceParts | GET | `/api/order-service-parts` | Admin,Receptionist | List all | `Api/Controllers/OrderServicePartsController.cs` |
| OrderServiceParts | GET | `/api/order-service-parts/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/OrderServicePartsController.cs` |
| OrderServiceParts | POST | `/api/order-service-parts` | Admin,Receptionist | Create | `Api/Controllers/OrderServicePartsController.cs` |
| OrderServiceParts | PUT | `/api/order-service-parts/{id}` | Admin,Receptionist | Update | `Api/Controllers/OrderServicePartsController.cs` |
| OrderServiceParts | DELETE | `/api/order-service-parts/{id}` | Admin,Receptionist | Delete | `Api/Controllers/OrderServicePartsController.cs` |
| OrderServices | GET | `/api/order-services` | Admin,Receptionist | List all | `Api/Controllers/OrderServicesController.cs` |
| OrderServices | GET | `/api/order-services/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/OrderServicesController.cs` |
| OrderServices | POST | `/api/order-services` | Admin,Receptionist | Create | `Api/Controllers/OrderServicesController.cs` |
| OrderServices | PUT | `/api/order-services/{id}` | Admin,Receptionist | Update | `Api/Controllers/OrderServicesController.cs` |
| OrderServices | DELETE | `/api/order-services/{id}` | Admin,Receptionist | Delete | `Api/Controllers/OrderServicesController.cs` |
| OrderStatuses | GET | `/api/order-statuses` | Admin | List all | `Api/Controllers/OrderStatusesController.cs` |
| OrderStatuses | GET | `/api/order-statuses/{id}` | Admin | Get by ID | `Api/Controllers/OrderStatusesController.cs` |
| OrderStatuses | POST | `/api/order-statuses` | Admin | Create | `Api/Controllers/OrderStatusesController.cs` |
| OrderStatuses | PUT | `/api/order-statuses/{id}` | Admin | Update | `Api/Controllers/OrderStatusesController.cs` |
| OrderStatuses | DELETE | `/api/order-statuses/{id}` | Admin | Delete | `Api/Controllers/OrderStatusesController.cs` |
| OrderStatusHistories | GET | `/api/order-status-histories` | Admin,Receptionist | List all | `Api/Controllers/OrderStatusHistoriesController.cs` |
| OrderStatusHistories | GET | `/api/order-status-histories/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/OrderStatusHistoriesController.cs` |
| OrderStatusHistories | POST | `/api/order-status-histories` | Admin,Receptionist | Create | `Api/Controllers/OrderStatusHistoriesController.cs` |
| OrderStatusHistories | PUT | `/api/order-status-histories/{id}` | Admin,Receptionist | Update | `Api/Controllers/OrderStatusHistoriesController.cs` |
| OrderStatusHistories | DELETE | `/api/order-status-histories/{id}` | Admin,Receptionist | Delete | `Api/Controllers/OrderStatusHistoriesController.cs` |
| PartBrands | GET | `/api/part-brands` | Admin | List all | `Api/Controllers/PartBrandsController.cs` |
| PartBrands | GET | `/api/part-brands/{id}` | Admin | Get by ID | `Api/Controllers/PartBrandsController.cs` |
| PartBrands | POST | `/api/part-brands` | Admin | Create | `Api/Controllers/PartBrandsController.cs` |
| PartBrands | PUT | `/api/part-brands/{id}` | Admin | Update | `Api/Controllers/PartBrandsController.cs` |
| PartBrands | DELETE | `/api/part-brands/{id}` | Admin | Delete | `Api/Controllers/PartBrandsController.cs` |
| PartCategories | GET | `/api/part-categories` | Admin | List all | `Api/Controllers/PartCategoriesController.cs` |
| PartCategories | GET | `/api/part-categories/{id}` | Admin | Get by ID | `Api/Controllers/PartCategoriesController.cs` |
| PartCategories | POST | `/api/part-categories` | Admin | Create | `Api/Controllers/PartCategoriesController.cs` |
| PartCategories | PUT | `/api/part-categories/{id}` | Admin | Update | `Api/Controllers/PartCategoriesController.cs` |
| PartCategories | DELETE | `/api/part-categories/{id}` | Admin | Delete | `Api/Controllers/PartCategoriesController.cs` |
| PartPurchaseDetails | GET | `/api/part-purchase-details` | Admin,Receptionist | List all | `Api/Controllers/PartPurchaseDetailsController.cs` |
| PartPurchaseDetails | GET | `/api/part-purchase-details/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PartPurchaseDetailsController.cs` |
| PartPurchaseDetails | POST | `/api/part-purchase-details` | Admin,Receptionist | Create | `Api/Controllers/PartPurchaseDetailsController.cs` |
| PartPurchaseDetails | PUT | `/api/part-purchase-details/{id}` | Admin,Receptionist | Update | `Api/Controllers/PartPurchaseDetailsController.cs` |
| PartPurchaseDetails | DELETE | `/api/part-purchase-details/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PartPurchaseDetailsController.cs` |
| PartPurchases | GET | `/api/part-purchases` | Admin,Receptionist | List all | `Api/Controllers/PartPurchasesController.cs` |
| PartPurchases | GET | `/api/part-purchases/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PartPurchasesController.cs` |
| PartPurchases | POST | `/api/part-purchases` | Admin,Receptionist | Create | `Api/Controllers/PartPurchasesController.cs` |
| PartPurchases | PUT | `/api/part-purchases/{id}` | Admin,Receptionist | Update | `Api/Controllers/PartPurchasesController.cs` |
| PartPurchases | DELETE | `/api/part-purchases/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PartPurchasesController.cs` |
| Parts | GET | `/api/parts` | Admin,Receptionist | List all | `Api/Controllers/PartsController.cs` |
| Parts | GET | `/api/parts/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PartsController.cs` |
| Parts | POST | `/api/parts` | Admin,Receptionist | Create | `Api/Controllers/PartsController.cs` |
| Parts | PUT | `/api/parts/{id}` | Admin,Receptionist | Update | `Api/Controllers/PartsController.cs` |
| Parts | DELETE | `/api/parts/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PartsController.cs` |
| Payment Business | POST | `/api/invoices/{id}/record-payment` | Admin,Receptionist | Business action | `Api/Controllers/PaymentBusinessController.cs` |
| Payment Business | GET | `/api/invoices/{id}/payment-summary` | Admin,Receptionist,Client | Business action | `Api/Controllers/PaymentBusinessController.cs` |
| Payment Business | POST | `/api/payments/{id}/refund` | Admin | Business action | `Api/Controllers/PaymentBusinessController.cs` |
| PaymentCards | GET | `/api/payment-cards` | Admin,Receptionist | List all | `Api/Controllers/PaymentCardsController.cs` |
| PaymentCards | GET | `/api/payment-cards/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PaymentCardsController.cs` |
| PaymentCards | POST | `/api/payment-cards` | Admin,Receptionist | Create | `Api/Controllers/PaymentCardsController.cs` |
| PaymentCards | PUT | `/api/payment-cards/{id}` | Admin,Receptionist | Update | `Api/Controllers/PaymentCardsController.cs` |
| PaymentCards | DELETE | `/api/payment-cards/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PaymentCardsController.cs` |
| PaymentMethods | GET | `/api/payment-methods` | Admin | List all | `Api/Controllers/PaymentMethodsController.cs` |
| PaymentMethods | GET | `/api/payment-methods/{id}` | Admin | Get by ID | `Api/Controllers/PaymentMethodsController.cs` |
| PaymentMethods | POST | `/api/payment-methods` | Admin | Create | `Api/Controllers/PaymentMethodsController.cs` |
| PaymentMethods | PUT | `/api/payment-methods/{id}` | Admin | Update | `Api/Controllers/PaymentMethodsController.cs` |
| PaymentMethods | DELETE | `/api/payment-methods/{id}` | Admin | Delete | `Api/Controllers/PaymentMethodsController.cs` |
| Payments | GET | `/api/payments` | Admin,Receptionist | List all | `Api/Controllers/PaymentsController.cs` |
| Payments | GET | `/api/payments/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PaymentsController.cs` |
| Payments | POST | `/api/payments` | Admin,Receptionist | Create | `Api/Controllers/PaymentsController.cs` |
| Payments | PUT | `/api/payments/{id}` | Admin,Receptionist | Update | `Api/Controllers/PaymentsController.cs` |
| Payments | DELETE | `/api/payments/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PaymentsController.cs` |
| PaymentStatuses | GET | `/api/payment-statuses` | Admin | List all | `Api/Controllers/PaymentStatusesController.cs` |
| PaymentStatuses | GET | `/api/payment-statuses/{id}` | Admin | Get by ID | `Api/Controllers/PaymentStatusesController.cs` |
| PaymentStatuses | POST | `/api/payment-statuses` | Admin | Create | `Api/Controllers/PaymentStatusesController.cs` |
| PaymentStatuses | PUT | `/api/payment-statuses/{id}` | Admin | Update | `Api/Controllers/PaymentStatusesController.cs` |
| PaymentStatuses | DELETE | `/api/payment-statuses/{id}` | Admin | Delete | `Api/Controllers/PaymentStatusesController.cs` |
| PersonEmails | GET | `/api/person-emails` | Admin,Receptionist | List all | `Api/Controllers/PersonEmailsController.cs` |
| PersonEmails | GET | `/api/person-emails/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PersonEmailsController.cs` |
| PersonEmails | POST | `/api/person-emails` | Admin,Receptionist | Create | `Api/Controllers/PersonEmailsController.cs` |
| PersonEmails | PUT | `/api/person-emails/{id}` | Admin,Receptionist | Update | `Api/Controllers/PersonEmailsController.cs` |
| PersonEmails | DELETE | `/api/person-emails/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PersonEmailsController.cs` |
| PersonPhones | GET | `/api/person-phones` | Admin,Receptionist | List all | `Api/Controllers/PersonPhonesController.cs` |
| PersonPhones | GET | `/api/person-phones/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PersonPhonesController.cs` |
| PersonPhones | POST | `/api/person-phones` | Admin,Receptionist | Create | `Api/Controllers/PersonPhonesController.cs` |
| PersonPhones | PUT | `/api/person-phones/{id}` | Admin,Receptionist | Update | `Api/Controllers/PersonPhonesController.cs` |
| PersonPhones | DELETE | `/api/person-phones/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PersonPhonesController.cs` |
| PersonRoles | GET | `/api/person-roles` | Admin | List all | `Api/Controllers/PersonRolesController.cs` |
| PersonRoles | GET | `/api/person-roles/{id}` | Admin | Get by ID | `Api/Controllers/PersonRolesController.cs` |
| PersonRoles | POST | `/api/person-roles` | Admin | Create | `Api/Controllers/PersonRolesController.cs` |
| PersonRoles | PUT | `/api/person-roles/{id}` | Admin | Update | `Api/Controllers/PersonRolesController.cs` |
| PersonRoles | DELETE | `/api/person-roles/{id}` | Admin | Delete | `Api/Controllers/PersonRolesController.cs` |
| Persons | GET | `/api/persons` | Admin,Receptionist | List all | `Api/Controllers/PersonsController.cs` |
| Persons | GET | `/api/persons/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/PersonsController.cs` |
| Persons | POST | `/api/persons` | Admin,Receptionist | Create | `Api/Controllers/PersonsController.cs` |
| Persons | PUT | `/api/persons/{id}` | Admin,Receptionist | Update | `Api/Controllers/PersonsController.cs` |
| Persons | DELETE | `/api/persons/{id}` | Admin,Receptionist | Delete | `Api/Controllers/PersonsController.cs` |
| Receptionist | POST | `/api/receptionist/create-client-with-vehicle` | Admin,Receptionist | Create | `Api/Controllers/ReceptionistClientController.cs` |
| Reports | GET | `/api/admin/reports/sales` | Admin | List all | `Api/Controllers/ReportsController.cs` |
| Reports | GET | `/api/admin/reports/inventory` | Admin | List all | `Api/Controllers/ReportsController.cs` |
| Reports | GET | `/api/admin/reports/mechanics` | Admin | List all | `Api/Controllers/ReportsController.cs` |
| Reports | GET | `/api/admin/reports/service-orders` | Admin | List all | `Api/Controllers/ReportsController.cs` |
| Reports | GET | `/api/admin/reports/payments` | Admin | List all | `Api/Controllers/ReportsController.cs` |
| Roles | GET | `/api/roles` | Admin | List all | `Api/Controllers/RolesController.cs` |
| Roles | GET | `/api/roles/{id}` | Admin | Get by ID | `Api/Controllers/RolesController.cs` |
| Roles | POST | `/api/roles` | Admin | Create | `Api/Controllers/RolesController.cs` |
| Roles | PUT | `/api/roles/{id}` | Admin | Update | `Api/Controllers/RolesController.cs` |
| Roles | DELETE | `/api/roles/{id}` | Admin | Delete | `Api/Controllers/RolesController.cs` |
| Search | GET | `/api/search/clients` | Admin,Receptionist | List all | `Api/Controllers/SearchController.cs` |
| Search | GET | `/api/search/vehicles` | Admin,Receptionist | List all | `Api/Controllers/SearchController.cs` |
| Search | GET | `/api/search/service-orders` | Admin,Receptionist,Mechanic | List all | `Api/Controllers/SearchController.cs` |
| Search | GET | `/api/search/invoices` | Admin,Receptionist | List all | `Api/Controllers/SearchController.cs` |
| Search | GET | `/api/search/parts` | Admin,Receptionist,Mechanic | List all | `Api/Controllers/SearchController.cs` |
| Search | GET | `/api/search/suppliers` | Admin,Receptionist | List all | `Api/Controllers/SearchController.cs` |
| Search | GET | `/api/search/mechanics` | Admin,Receptionist | List all | `Api/Controllers/SearchController.cs` |
| ServiceOrders | GET | `/api/service-orders` | Admin,Receptionist | List all | `Api/Controllers/ServiceOrdersController.cs` |
| ServiceOrders | GET | `/api/service-orders/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/ServiceOrdersController.cs` |
| ServiceOrders | POST | `/api/service-orders` | Admin,Receptionist | Create | `Api/Controllers/ServiceOrdersController.cs` |
| ServiceOrders | PUT | `/api/service-orders/{id}` | Admin,Receptionist | Update | `Api/Controllers/ServiceOrdersController.cs` |
| ServiceOrders | DELETE | `/api/service-orders/{id}` | Admin,Receptionist | Delete | `Api/Controllers/ServiceOrdersController.cs` |
| Service Order Workflow | GET | `/api/service-orders/{id}/full-detail` | Admin,Receptionist,Mechanic,Client | Business action | `Api/Controllers/ServiceOrderWorkflowController.cs` |
| Service Order Workflow | POST | `/api/service-orders/{id}/change-status` | Admin,Receptionist | Business action | `Api/Controllers/ServiceOrderWorkflowController.cs` |
| Service Order Workflow | POST | `/api/service-orders/{id}/cancel` | Admin,Receptionist | Business action | `Api/Controllers/ServiceOrderWorkflowController.cs` |
| Service Order Workflow | POST | `/api/service-orders/{id}/void` | Admin | Business action | `Api/Controllers/ServiceOrderWorkflowController.cs` |
| Service Order Workflow | POST | `/api/service-orders/{id}/complete` | Admin,Receptionist,Mechanic | Business action | `Api/Controllers/ServiceOrderWorkflowController.cs` |
| ServiceTypes | GET | `/api/service-types` | Admin | List all | `Api/Controllers/ServiceTypesController.cs` |
| ServiceTypes | GET | `/api/service-types/{id}` | Admin | Get by ID | `Api/Controllers/ServiceTypesController.cs` |
| ServiceTypes | POST | `/api/service-types` | Admin | Create | `Api/Controllers/ServiceTypesController.cs` |
| ServiceTypes | PUT | `/api/service-types/{id}` | Admin | Update | `Api/Controllers/ServiceTypesController.cs` |
| ServiceTypes | DELETE | `/api/service-types/{id}` | Admin | Delete | `Api/Controllers/ServiceTypesController.cs` |
| Staff | POST | `/api/staff/register` | Admin | Create | `Api/Controllers/StaffController.cs` |
| StreetTypes | GET | `/api/street-types` | Admin | List all | `Api/Controllers/StreetTypesController.cs` |
| StreetTypes | GET | `/api/street-types/{id}` | Admin | Get by ID | `Api/Controllers/StreetTypesController.cs` |
| StreetTypes | POST | `/api/street-types` | Admin | Create | `Api/Controllers/StreetTypesController.cs` |
| StreetTypes | PUT | `/api/street-types/{id}` | Admin | Update | `Api/Controllers/StreetTypesController.cs` |
| StreetTypes | DELETE | `/api/street-types/{id}` | Admin | Delete | `Api/Controllers/StreetTypesController.cs` |
| Suppliers | GET | `/api/suppliers` | Admin,Receptionist | List all | `Api/Controllers/SuppliersController.cs` |
| Suppliers | GET | `/api/suppliers/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/SuppliersController.cs` |
| Suppliers | POST | `/api/suppliers` | Admin,Receptionist | Create | `Api/Controllers/SuppliersController.cs` |
| Suppliers | PUT | `/api/suppliers/{id}` | Admin,Receptionist | Update | `Api/Controllers/SuppliersController.cs` |
| Suppliers | DELETE | `/api/suppliers/{id}` | Admin,Receptionist | Delete | `Api/Controllers/SuppliersController.cs` |
| Users | GET | `/api/users` | Admin | List all | `Api/Controllers/UsersController.cs` |
| Users | GET | `/api/users/{id}` | Admin | Get by ID | `Api/Controllers/UsersController.cs` |
| Users | POST | `/api/users` | Admin | Create | `Api/Controllers/UsersController.cs` |
| Users | PUT | `/api/users/{id}` | Admin | Update | `Api/Controllers/UsersController.cs` |
| Users | DELETE | `/api/users/{id}` | Admin | Delete | `Api/Controllers/UsersController.cs` |
| User Status | PUT | `/api/users/{id}/activate` | Admin | Business action | `Api/Controllers/UserStatusController.cs` |
| User Status | PUT | `/api/users/{id}/deactivate` | Admin | Business action | `Api/Controllers/UserStatusController.cs` |
| VehicleBrands | GET | `/api/vehicle-brands` | Admin | List all | `Api/Controllers/VehicleBrandsController.cs` |
| VehicleBrands | GET | `/api/vehicle-brands/{id}` | Admin | Get by ID | `Api/Controllers/VehicleBrandsController.cs` |
| VehicleBrands | POST | `/api/vehicle-brands` | Admin | Create | `Api/Controllers/VehicleBrandsController.cs` |
| VehicleBrands | PUT | `/api/vehicle-brands/{id}` | Admin | Update | `Api/Controllers/VehicleBrandsController.cs` |
| VehicleBrands | DELETE | `/api/vehicle-brands/{id}` | Admin | Delete | `Api/Controllers/VehicleBrandsController.cs` |
| VehicleEntryInventories | GET | `/api/vehicle-entry-inventories` | Admin,Receptionist | List all | `Api/Controllers/VehicleEntryInventoriesController.cs` |
| VehicleEntryInventories | GET | `/api/vehicle-entry-inventories/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/VehicleEntryInventoriesController.cs` |
| VehicleEntryInventories | POST | `/api/vehicle-entry-inventories` | Admin,Receptionist | Create | `Api/Controllers/VehicleEntryInventoriesController.cs` |
| VehicleEntryInventories | PUT | `/api/vehicle-entry-inventories/{id}` | Admin,Receptionist | Update | `Api/Controllers/VehicleEntryInventoriesController.cs` |
| VehicleEntryInventories | DELETE | `/api/vehicle-entry-inventories/{id}` | Admin,Receptionist | Delete | `Api/Controllers/VehicleEntryInventoriesController.cs` |
| VehicleModels | GET | `/api/vehicle-models` | Admin | List all | `Api/Controllers/VehicleModelsController.cs` |
| VehicleModels | GET | `/api/vehicle-models/{id}` | Admin | Get by ID | `Api/Controllers/VehicleModelsController.cs` |
| VehicleModels | POST | `/api/vehicle-models` | Admin | Create | `Api/Controllers/VehicleModelsController.cs` |
| VehicleModels | PUT | `/api/vehicle-models/{id}` | Admin | Update | `Api/Controllers/VehicleModelsController.cs` |
| VehicleModels | DELETE | `/api/vehicle-models/{id}` | Admin | Delete | `Api/Controllers/VehicleModelsController.cs` |
| VehicleOwnerHistories | GET | `/api/vehicle-owner-histories` | Admin,Receptionist | List all | `Api/Controllers/VehicleOwnerHistoriesController.cs` |
| VehicleOwnerHistories | GET | `/api/vehicle-owner-histories/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/VehicleOwnerHistoriesController.cs` |
| VehicleOwnerHistories | POST | `/api/vehicle-owner-histories` | Admin,Receptionist | Create | `Api/Controllers/VehicleOwnerHistoriesController.cs` |
| VehicleOwnerHistories | PUT | `/api/vehicle-owner-histories/{id}` | Admin,Receptionist | Update | `Api/Controllers/VehicleOwnerHistoriesController.cs` |
| VehicleOwnerHistories | DELETE | `/api/vehicle-owner-histories/{id}` | Admin,Receptionist | Delete | `Api/Controllers/VehicleOwnerHistoriesController.cs` |
| Vehicles | GET | `/api/vehicles` | Admin,Receptionist | List all | `Api/Controllers/VehiclesController.cs` |
| Vehicles | GET | `/api/vehicles/{id}` | Admin,Receptionist | Get by ID | `Api/Controllers/VehiclesController.cs` |
| Vehicles | POST | `/api/vehicles` | Admin,Receptionist | Create | `Api/Controllers/VehiclesController.cs` |
| Vehicles | PUT | `/api/vehicles/{id}` | Admin,Receptionist | Update | `Api/Controllers/VehiclesController.cs` |
| Vehicles | DELETE | `/api/vehicles/{id}` | Admin,Receptionist | Delete | `Api/Controllers/VehiclesController.cs` |
| VehicleTypes | GET | `/api/vehicle-types` | Admin | List all | `Api/Controllers/VehicleTypesController.cs` |
| VehicleTypes | GET | `/api/vehicle-types/{id}` | Admin | Get by ID | `Api/Controllers/VehicleTypesController.cs` |
| VehicleTypes | POST | `/api/vehicle-types` | Admin | Create | `Api/Controllers/VehicleTypesController.cs` |
| VehicleTypes | PUT | `/api/vehicle-types/{id}` | Admin | Update | `Api/Controllers/VehicleTypesController.cs` |
| VehicleTypes | DELETE | `/api/vehicle-types/{id}` | Admin | Delete | `Api/Controllers/VehicleTypesController.cs` |
| Workshop Intake | POST | `/api/workshop-intake/create-service-order` | Admin,Receptionist | Create | `Api/Controllers/WorkshopIntakeController.cs` |

---

## 9. Detailed Endpoint Documentation

### Standard CRUD pattern (46 resources)

Most resource controllers follow this pattern. DTOs and request types live under `Application/Features/{Module}/Dtos/` and `Application/Features/{Module}/Requests/`.

| Operation | Method | Route | Auth | Success | Request | Response |
|-----------|--------|-------|------|---------|---------|----------|
| List | GET | `/api/{resource}` *(template placeholder, not a real route)* | Per controller | 200 | - | `{Entity}Dto[]` |
| Get by ID | GET | `/api/{resource}/{id}` *(template placeholder)* | Per controller | 200 | Route: `id` | `{Entity}Dto` |
| Create | POST | `/api/{resource}` *(template placeholder)* | Per controller | 201 | `Create{Entity}Request` | `{Entity}Dto` |
| Update | PUT | `/api/{resource}/{id}` *(template placeholder)* | Per controller | 200 | Route: `id` + `Update{Entity}Request` | `{Entity}Dto` |
| Delete | DELETE | `/api/{resource}/{id}` *(template placeholder)* | Per controller | 204 | Route: `id` | - |

**Errors:** 400 validation, 404 not found, 409 conflict (per `BaseApiController` rules).

#### Example: Persons CRUD

**Source:** `Api/Controllers/PersonsController.cs`  
**Auth:** Admin, Receptionist

##### GET /api/persons

Returns all persons as `PersonDto[]`.

##### POST /api/persons

**Request body:**

```json
{
  "documentTypeId": 1,
  "documentNumber": "1234567890",
  "firstName": "Juan",
  "middleName": null,
  "lastName": "Perez",
  "secondLastName": null,
  "birthDate": "1990-01-15T00:00:00Z",
  "genderId": 1,
  "addressId": null
}
```

**Success (201):** `PersonDto` with generated `personId` and `createdAt`.

##### Vehicle brands (Admin CRUD)

**Auth:** Admin only  
**Source:** `Api/Controllers/VehicleBrandsController.cs`, `Application/Features/VehicleBrands/*`

| Method | Route | Success |
|--------|-------|---------|
| GET | `/api/vehicle-brands` | `VehicleBrandDto[]` |
| GET | `/api/vehicle-brands/{id}` | `VehicleBrandDto` |
| POST | `/api/vehicle-brands` | `VehicleBrandDto` (201) |
| PUT | `/api/vehicle-brands/{id}` | `VehicleBrandDto` |
| DELETE | `/api/vehicle-brands/{id}` | 204 No Content |

**Response (`VehicleBrandDto`):**

| Field | Type | Notes |
|-------|------|-------|
| brandId | int | PK |
| brandName | string | Max 80 chars |

**Create body (`CreateVehicleBrandRequest`):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| brandName | string | Yes | Trimmed; non-empty; max 80; unique |

**Update body (`UpdateVehicleBrandRequest`):** same fields as create.

**Example create request:**

```json
{ "brandName": "Toyota" }
```

**Possible errors:** 404 NotFound; 409 BrandNameAlreadyExists; 409 InUse on delete when models reference the brand.

##### Vehicle models (Admin CRUD)

**Auth:** Admin only  
**Source:** `Api/Controllers/VehicleModelsController.cs`, `Application/Features/VehicleModels/*`

| Method | Route | Success |
|--------|-------|---------|
| GET | `/api/vehicle-models` | `VehicleModelDto[]` |
| GET | `/api/vehicle-models/{id}` | `VehicleModelDto` |
| POST | `/api/vehicle-models` | `VehicleModelDto` (201) |
| PUT | `/api/vehicle-models/{id}` | `VehicleModelDto` |
| DELETE | `/api/vehicle-models/{id}` | 204 No Content |

**Response (`VehicleModelDto`):**

| Field | Type | Notes |
|-------|------|-------|
| modelId | int | PK |
| brandId | int | FK → VehicleBrand |
| modelName | string | Max 80 chars; unique per brand |

**Create body (`CreateVehicleModelRequest`):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| brandId | int | Yes | Must be > 0; brand must exist |
| modelName | string | Yes | Trimmed; non-empty; max 80; unique within brand |

**Update body (`UpdateVehicleModelRequest`):** same fields as create.

**Example create request:**

```json
{ "brandId": 1, "modelName": "Corolla" }
```

**Possible errors:** 404 NotFound; 400 BrandIdInvalid / ModelNameRequired / ModelNameTooLong; 404 BrandNotFound; 409 ModelNameAlreadyExists; 409 InUse on delete when vehicles reference the model.

##### Vehicles (Admin CRUD)

**Auth:** Admin, Receptionist  
**Source:** `Api/Controllers/VehiclesController.cs`, `Application/Features/Vehicles/*`

| Method | Route | Success |
|--------|-------|---------|
| GET | `/api/vehicles` | `VehicleDto[]` |
| GET | `/api/vehicles/{id}` | `VehicleDto` |
| POST | `/api/vehicles` | `VehicleDto` (201) |
| PUT | `/api/vehicles/{id}` | `VehicleDto` |
| DELETE | `/api/vehicles/{id}` | 204 No Content |

**Response (`VehicleDto`):**

| Field | Type | Notes |
|-------|------|-------|
| vehicleId | int | PK |
| modelId | int | FK → VehicleModel |
| vehicleTypeId | int | FK → VehicleType |
| plate | string | Required; trim + uppercase; 5–10 chars; `^[A-Z0-9]+(?:-[A-Z0-9]+)*$`; unique among active vehicles |
| vin | string | Exactly 17 alphanumeric characters (normalized uppercase) |
| year | int | 1900 … current UTC year + 1 |
| color | string? | Max 30 chars |
| mileage | int | ≥ 0 |
| isActive | bool | |
| createdAt | string (ISO date-time)? | Present on list/get responses |

**Create body (`CreateVehicleRequest`) / Update body (`UpdateVehicleRequest`):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| modelId | int | Yes | > 0; model must exist |
| vehicleTypeId | int | Yes | > 0; type must exist |
| plate | string | Yes | Trimmed; uppercase; 5–10 chars; letters, digits, optional hyphens; unique among active vehicles |
| vin | string | Yes | Trimmed; uppercase; exactly 17 letters/digits; unique |
| year | int | Yes | 1900 … current UTC year + 1 |
| color | string? | No | Max 30 chars |
| mileage | int | Yes | ≥ 0 |
| isActive | bool | Yes | |

**Plate validation (shared by vehicle CRUD and client vehicle flows):**

| Rule | Value |
|------|-------|
| Normalization | Trim + uppercase |
| Min length | 5 |
| Max length | 10 |
| Pattern | `^[A-Z0-9]+(?:-[A-Z0-9]+)*$` |
| Uniqueness | Among **active** vehicles only |

**Example create request:**

```json
{
  "modelId": 1,
  "vehicleTypeId": 1,
  "plate": "ABC123",
  "vin": "1HGBH41JXMN109186",
  "year": 2020,
  "color": "Silver",
  "mileage": 45000,
  "isActive": true
}
```

**Possible errors:** 404 NotFound; 400 validation (modelId, vehicleTypeId, plate, vin, year, color, mileage); 404 ModelNotFound / VehicleTypeNotFound; 409 VinAlreadyExists; 409 `Vehicles.PlateAlreadyExists`; 400 `Vehicles.PlateRequired`; 400 `Vehicles.PlateInvalid`; 409 InUse on delete when owner history or service orders reference the vehicle.

**Transfer ownership** (unchanged): `POST /api/vehicles/{vehicleId}/transfer-ownership` — see Client vehicles section.

##### Service orders — direct update (PUT)

**Auth:** Admin, Receptionist  
**Source:** `Api/Controllers/ServiceOrdersController.cs`, `Application/Features/ServiceOrders/Requests/UpdateServiceOrderRequest.cs`

`PUT /api/service-orders/{id}` updates header fields on an existing order. **Status changes** should use workflow routes (`POST …/change-status`, `cancel`, `void`, `complete`). The update body still requires `orderStatusId` (send the current value when editing header fields only).

**Update body (`UpdateServiceOrderRequest`):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| vehicleId | int | Yes | Must exist and be active |
| orderStatusId | int | Yes | Must exist; use workflow endpoints to change status in the UI |
| entryDate | string (ISO date-time) | Yes | |
| estimatedDeliveryDate | string (ISO date-time)? | No | |
| generalDescription | string? | No | |
| cancellationReason | string? | Conditional | Required when `orderStatusId` is Cancelled or Voided |
| cancellationDate | string (ISO date-time)? | No | Defaults to UTC now when status is Cancelled/Voided and reason is set |

**Example update (header edit, status unchanged):**

```json
{
  "vehicleId": 12,
  "orderStatusId": 2,
  "entryDate": "2026-05-31T10:00:00Z",
  "estimatedDeliveryDate": "2026-06-02T18:00:00Z",
  "generalDescription": "Oil change and brake inspection"
}
```

**Possible errors:** 404 NotFound; 404 VehicleNotFound; 400 VehicleInactive; 404 OrderStatusNotFound; 409 ActiveOrderAlreadyExists; 400 CancellationReasonRequired when status is Cancelled/Voided.

##### Order services — CRUD

**Auth:** Admin, Receptionist (CRUD); Admin, Receptionist, Mechanic (execution routes below)  
**Source:** `Api/Controllers/OrderServicesController.cs`, `Application/Features/OrderServices/*`

| Method | Route | Success |
|--------|-------|---------|
| GET | `/api/order-services` | `OrderServiceDto[]` |
| GET | `/api/order-services/{id}` | `OrderServiceDto` |
| POST | `/api/order-services` | `OrderServiceDto` (201) |
| PUT | `/api/order-services/{id}` | `OrderServiceDto` |
| DELETE | `/api/order-services/{id}` | 204 No Content |

**Response (`OrderServiceDto`):**

| Field | Type | Notes |
|-------|------|-------|
| orderServiceId | int | PK |
| serviceOrderId | int | FK → ServiceOrder |
| serviceTypeId | int | FK → ServiceType |
| description | string? | |
| workPerformed | string? | |
| laborCost | decimal | ≥ 0 |
| customerApproved | bool? | |
| approvalDate | string (ISO date-time)? | |

**Create body (`CreateOrderServiceRequest`) / Update body (`UpdateOrderServiceRequest`):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| serviceOrderId | int | Yes | Order must exist; not Cancelled/Voided |
| serviceTypeId | int | Yes | Must exist |
| description | string? | No | |
| workPerformed | string? | No | Prefer `PUT …/work-report` for mechanic updates |
| laborCost | decimal | Yes | ≥ 0 |
| customerApproved | bool? | No | |
| approvalDate | string (ISO date-time)? | No | Resolved with approval flag in service |

**Example create request:**

```json
{
  "serviceOrderId": 5,
  "serviceTypeId": 2,
  "description": "Replace front pads",
  "laborCost": 120.0
}
```

**Possible errors:** 404 NotFound; 404 ServiceOrderNotFound / ServiceTypeNotFound; 409 ServiceOrderCannotBeModifiedConflict when parent order is Cancelled or Voided.

**Execution routes** (unchanged): `PUT /api/order-services/{id}/work-report`, `POST …/assign-mechanic`, `POST …/unassign-mechanic`, `POST …/request-part` — see §10 Order service execution.

##### CRUD resources reference

| Resource route | DTO | Create request | Update request | Auth roles |
|----------------|-----|----------------|----------------|------------|
| `/api/addresses` | AddressDto | CreateAddressRequest | UpdateAddressRequest | Admin, Receptionist |
| `/api/audit-action-types` | AuditActionTypeDto | CreateAuditActionTypeRequest | UpdateAuditActionTypeRequest | Admin |
| `/api/audits` | AuditDto | CreateAuditRequest | UpdateAuditRequest | Admin |
| `/api/card-types` | CardTypeDto | CreateCardTypeRequest | UpdateCardTypeRequest | Admin |
| `/api/cities` | CityDto | CreateCityRequest | UpdateCityRequest | Admin |
| `/api/countries` | CountryDto | CreateCountryRequest | UpdateCountryRequest | Admin |
| `/api/departments` | DepartmentDto | CreateDepartmentRequest | UpdateDepartmentRequest | Admin |
| `/api/document-types` | DocumentTypeDto | CreateDocumentTypeRequest | UpdateDocumentTypeRequest | Admin |
| `/api/email-domains` | EmailDomainDto | CreateEmailDomainRequest | UpdateEmailDomainRequest | Admin |
| `/api/genders` | GenderDto | CreateGenderRequest | UpdateGenderRequest | Admin |
| `/api/invoice-details` | InvoiceDetailDto | CreateInvoiceDetailRequest | UpdateInvoiceDetailRequest | Admin, Receptionist |
| `/api/invoices` | InvoiceDto | CreateInvoiceRequest | UpdateInvoiceRequest | Admin, Receptionist |
| `/api/invoice-statuses` | InvoiceStatusDto | CreateInvoiceStatusRequest | UpdateInvoiceStatusRequest | Admin |
| `/api/mechanic-assignments` | MechanicAssignmentDto | CreateMechanicAssignmentRequest | UpdateMechanicAssignmentRequest | Admin, Receptionist |
| `/api/mechanic-specialties` | MechanicSpecialtyDto | CreateMechanicSpecialtyRequest | UpdateMechanicSpecialtyRequest | Admin |
| `/api/mechanic-specialty-assignments` | MechanicSpecialtyAssignmentDto | CreateMechanicSpecialtyAssignmentRequest | UpdateMechanicSpecialtyAssignmentRequest | Admin, Receptionist |
| `/api/neighborhoods` | NeighborhoodDto | CreateNeighborhoodRequest | UpdateNeighborhoodRequest | Admin |
| `/api/order-service-parts` | OrderServicePartDto | CreateOrderServicePartRequest | UpdateOrderServicePartRequest | Admin, Receptionist |
| `/api/order-services` | OrderServiceDto | CreateOrderServiceRequest | UpdateOrderServiceRequest | Admin, Receptionist |
| `/api/order-statuses` | OrderStatusDto | CreateOrderStatusRequest | UpdateOrderStatusRequest | Admin |
| `/api/order-status-histories` | OrderStatusHistoryDto | CreateOrderStatusHistoryRequest | UpdateOrderStatusHistoryRequest | Admin, Receptionist |
| `/api/part-brands` | PartBrandDto | CreatePartBrandRequest | UpdatePartBrandRequest | Admin |
| `/api/part-categories` | PartCategoryDto | CreatePartCategoryRequest | UpdatePartCategoryRequest | Admin |
| `/api/part-purchase-details` | PartPurchaseDetailDto | CreatePartPurchaseDetailRequest | UpdatePartPurchaseDetailRequest | Admin, Receptionist |
| `/api/part-purchases` | PartPurchaseDto | CreatePartPurchaseRequest | UpdatePartPurchaseRequest | Admin, Receptionist |
| `/api/parts` | PartDto | CreatePartRequest | UpdatePartRequest | Admin, Receptionist |
| `/api/payment-cards` | PaymentCardDto | CreatePaymentCardRequest | UpdatePaymentCardRequest | Admin, Receptionist |
| `/api/payment-methods` | PaymentMethodDto | CreatePaymentMethodRequest | UpdatePaymentMethodRequest | Admin |
| `/api/payments` | PaymentDto | CreatePaymentRequest | UpdatePaymentRequest | Admin, Receptionist |
| `/api/payment-statuses` | PaymentStatusDto | CreatePaymentStatusRequest | UpdatePaymentStatusRequest | Admin |
| `/api/person-emails` | PersonEmailDto | CreatePersonEmailRequest | UpdatePersonEmailRequest | Admin, Receptionist |
| `/api/person-phones` | PersonPhoneDto | CreatePersonPhoneRequest | UpdatePersonPhoneRequest | Admin, Receptionist |
| `/api/person-roles` | PersonRoleDto | CreatePersonRoleRequest | UpdatePersonRoleRequest | Admin |
| `/api/persons` | PersonDto | CreatePersonRequest | UpdatePersonRequest | Admin, Receptionist |
| `/api/roles` | RoleDto | CreateRoleRequest | UpdateRoleRequest | Admin |
| `/api/service-orders` | ServiceOrderDto | CreateServiceOrderRequest | UpdateServiceOrderRequest | Admin, Receptionist |
| `/api/service-types` | ServiceTypeDto | CreateServiceTypeRequest | UpdateServiceTypeRequest | Admin |
| `/api/street-types` | StreetTypeDto | CreateStreetTypeRequest | UpdateStreetTypeRequest | Admin |
| `/api/suppliers` | SupplierDto | CreateSupplierRequest | UpdateSupplierRequest | Admin, Receptionist |
| `/api/users` | UserDto | CreateUserRequest | UpdateUserRequest | Admin |
| `/api/vehicle-brands` | VehicleBrandDto | CreateVehicleBrandRequest | UpdateVehicleBrandRequest | Admin |
| `/api/vehicle-entry-inventories` | VehicleEntryInventoryDto | CreateVehicleEntryInventoryRequest | UpdateVehicleEntryInventoryRequest | Admin, Receptionist |
| `/api/vehicle-models` | VehicleModelDto | CreateVehicleModelRequest | UpdateVehicleModelRequest | Admin |
| `/api/vehicle-owner-histories` | VehicleOwnerHistoryDto | CreateVehicleOwnerHistoryRequest | UpdateVehicleOwnerHistoryRequest | Admin, Receptionist |
| `/api/vehicles` | VehicleDto | CreateVehicleRequest | UpdateVehicleRequest | Admin, Receptionist |
| `/api/vehicle-types` | VehicleTypeDto | CreateVehicleTypeRequest | UpdateVehicleTypeRequest | Admin |

---

### Authentication

#### POST /api/auth/register-client

**Description:** Register a new client user with person profile, email, and password.

**Auth:** Not required

**Roles:** -

**Source:** `Api/Controllers/AuthController.cs`

**Request body:** `RegisterClientRequest`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| documentTypeId | int | Yes | Must exist |
| documentNumber | string | Yes | Max 30, unique |
| firstName | string | Yes | Max 50 |
| middleName | string | No | Max 50 |
| lastName | string | Yes | Max 50 |
| secondLastName | string | No | Max 50 |
| birthDate | DateTime? | No | Cannot be future |
| genderId | int? | No | Must exist if provided |
| addressId | int? | No | Must exist if provided |
| email | string | Yes | Valid email format, unique |
| phoneCountryId | int? | Conditional | Required if phoneNumber provided |
| phoneNumber | string | No | Digits/+, max 20, unique per country |
| password | string | Yes | 8-100 chars |

**Success (200):** `AuthResponseDto`

**Possible errors:** 400 validation, 409 document/email/phone already exists

**Frontend notes:** Load `GET /api/catalogs/public-registration` first for dropdown data.

**Example request:**

```json
{
  "documentTypeId": 1,
  "documentNumber": "1098765432",
  "firstName": "Maria",
  "lastName": "Lopez",
  "email": "maria@example.com",
  "password": "SecurePass1"
}
```

**Example response:** Example not explicitly available (shape defined by `AuthResponseDto`).

#### POST /api/auth/login

**Description:** Authenticate with email and password.

**Auth:** Not required

**Source:** `Api/Controllers/AuthController.cs`

**Request body:** `{ "email": "string", "password": "string" }`

**Success (200):** `AuthResponseDto`

**Possible errors:** 400 missing fields, 400 InvalidCredentials, 400 UserInactiveInvalid

#### POST /api/auth/refresh

**Description:** Exchange refresh token for new access + refresh tokens.

**Auth:** Not required

**Source:** `Api/Controllers/AuthController.cs`

**Request body:** `{ "refreshToken": "string" }`

**Success (200):** `AuthResponseDto`

**Possible errors:** 400 RefreshTokenRequired, RefreshTokenInvalid, RefreshTokenExpired

#### POST /api/auth/logout

**Description:** Clear refresh token server-side.

**Auth:** Not required

**Source:** `Api/Controllers/AuthController.cs`

**Request body:** `{ "refreshToken": "string" }`

**Success:** 204 No Content

---

### Account

#### GET /api/account/me

**Description:** Get current authenticated user profile.

**Auth:** Required (any role)

**Source:** `Api/Controllers/AccountController.cs`

**Success (200):** `AccountProfileDto`

#### PUT /api/account/me

**Description:** Update current user profile (name, birth date, gender, address, email, phone).

**Auth:** Required

**Source:** `Api/Controllers/AccountController.cs`

**Request body (`UpdateAccountProfileRequest`):** `firstName`, `middleName`, `lastName`, `secondLastName`, `birthDate`, `genderId`, `addressId`, `email`, `phoneCountryId`, `phoneNumber`

**Success (200):** `AccountProfileDto`

#### POST /api/account/change-password

**Description:** Change password for current user.

**Auth:** Required

**Source:** `Api/Controllers/AccountController.cs`

**Request body:** `{ "currentPassword": "string", "newPassword": "string" }`

**Success:** 204 No Content

---

### Catalogs

#### GET /api/catalogs/public-registration

**Description:** Lookup data for client registration forms.

**Auth:** Not required (`[AllowAnonymous]`)

**Source:** `Api/Controllers/CatalogsController.cs`

**Success (200):** `PublicRegistrationCatalogsDto` (documentTypes, genders, countries, departments, cities, streetTypes, neighborhoods as `CatalogItemDto[]`)

#### GET /api/catalogs/workshop

**Description:** Lookup data for workshop operations.

**Auth:** Admin, Receptionist, Mechanic

**Source:** `Api/Controllers/CatalogsController.cs`

**Success (200):** `WorkshopCatalogsDto`

---

### Dashboards

All dashboard actions accept **no query parameters** (`DashboardsController`). Date-range filtering exists only on **reports**, not dashboards.

#### GET /api/client/dashboard

**Auth:** Client  
**Source:** `Api/Controllers/DashboardsController.cs`  
**Success (200):** `ClientDashboardDto` — scoped by JWT `personId` claim

| Field | Type | Description |
|-------|------|-------------|
| activeServiceOrders | int | |
| pendingApprovals | int | |
| pendingInvoices | int | |
| totalVehicles | int | |
| recentServiceOrderIds | int[] | |

**Source DTO:** `Application/Features/Dashboards/Dtos/ClientDashboardDto.cs`

#### GET /api/mechanic/dashboard

**Auth:** Mechanic  
**Success (200):** `MechanicDashboardDto` — scoped by `personId` claim

| Field | Type | Description |
|-------|------|-------------|
| assignedServices | int | |
| activeOrders | int | |
| pendingWorkReports | int | |
| requestedPartsPendingApproval | int | |
| activeServiceOrderIds | int[] | |

**Source DTO:** `Application/Features/Dashboards/Dtos/MechanicDashboardDto.cs`

#### GET /api/receptionist/dashboard

**Auth:** Receptionist  
**Success (200):** `ReceptionistDashboardDto`

| Field | Type |
|-------|------|
| pendingOrders | int |
| inProgressOrders | int |
| completedOrdersToday | int |
| vehiclesCurrentlyInWorkshop | int |
| pendingInvoices | int |
| lowStockParts | int |

**Source DTO:** `Application/Features/Dashboards/Dtos/ReceptionistDashboardDto.cs`

#### GET /api/admin/dashboard

**Auth:** Admin  
**Success (200):** `AdminDashboardDto`

| Field | Type | Notes |
|-------|------|-------|
| totalUsers | int | Maps to reference UI “Total Users” |
| activeUsers | int | |
| totalClients | int | |
| totalMechanics | int | |
| activeServiceOrders | int | |
| pendingOrders | int | |
| inProgressOrders | int | |
| completedOrders | int | Aggregate (not “this month” unless service logic defines it) |
| lowStockParts | int | |
| totalInvoicedAmount | decimal | |
| totalCompletedPaymentsAmount | decimal | |
| pendingPaymentAmount | decimal | |

**Source DTO:** `Application/Features/Dashboards/Dtos/AdminDashboardDto.cs`

> Reference dashboard mockup may show extra KPIs (e.g. “Vehicles serviced this month”); only fields above are returned by the API.

---

### Search

All search endpoints require query parameter **`term`**.

| Method | Route | Auth | Response |
|--------|-------|------|----------|
| GET | `/api/search/clients` | Admin, Receptionist | `ClientSearchResultDto[]` |
| GET | `/api/search/vehicles` | Admin, Receptionist | `VehicleSearchResultDto[]` |
| GET | `/api/search/service-orders` | Admin, Receptionist, Mechanic | `ServiceOrderSearchResultDto[]` |
| GET | `/api/search/invoices` | Admin, Receptionist | `InvoiceSearchResultDto[]` |
| GET | `/api/search/parts` | Admin, Receptionist, Mechanic | `PartSearchResultDto[]` |
| GET | `/api/search/suppliers` | Admin, Receptionist | `SupplierSearchResultDto[]` |
| GET | `/api/search/mechanics` | Admin, Receptionist | `MechanicSearchResultDto[]` |

**Source:** `Api/Controllers/SearchController.cs`

**Term validation:** `term` is required and must be at least **2 characters** (`SearchErrors.SearchTermRequired`, `SearchErrors.SearchTermTooShort`).

**Vehicle search (`GET /api/search/vehicles?term=`):** Matches `vehicleId`, `plate`, `vin`, `color`, and string forms of `year` (case-insensitive substring). Response: `VehicleSearchResultDto` includes `plate`.

**Service order search (`GET /api/search/service-orders?term=`):** Matches `serviceOrderId`, `vehicleId`, and `generalDescription` (case-insensitive substring). Response: `ServiceOrderSearchResultDto` — does **not** include client name, VIN, plate, or vehicle model. **`term` must be at least 2 characters** (same rule as all search routes); single-digit order or vehicle IDs cannot be matched by ID alone — use description or a longer numeric substring (e.g. order `12` matches term `12`).

---

### Workshop intake

#### POST /api/workshop-intake/create-service-order

**Description:** Create service order with entry inventory and initial services in one transaction.

**Auth:** Admin, Receptionist

**Source:** `Api/Controllers/WorkshopIntakeController.cs`

**Request body:** `CreateWorkshopIntakeRequest`

| Field | Type | Notes |
|-------|------|-------|
| vehicleId | int | Required |
| initialOrderStatusId | int? | Defaults to Pending if omitted |
| entryDate | DateTime? | |
| estimatedDeliveryDate | DateTime? | |
| generalDescription | string? | |
| hasScratches, scratchesDescription | bool, string? | Entry inventory |
| hasToolbox, toolboxDescription | bool, string? | |
| ownershipCardDelivered | bool | |
| inventoryObservations | string? | |
| services | array | `{ serviceTypeId, description?, laborCost }` |

**Success (201):** `WorkshopIntakeDto`

---

### Receptionist client onboarding

#### POST /api/receptionist/create-client-with-vehicle

**Description:** Create person + vehicle + ownership in one flow (no user account unless separately created).

**Auth:** Admin, Receptionist

**Source:** `Api/Controllers/ReceptionistClientController.cs`

**Request body:** `CreateClientWithVehicleRequest` (person fields + vehicle: modelId, vehicleTypeId, **plate**, vin, year, color?, mileage)

**Success (200):** `ClientWithVehicleDto` (includes `plate`)

**Plate errors (client flows):** 400 `ClientVehicleFlows.PlateRequired`; 400 `ClientVehicleFlows.PlateInvalid`; 409 `ClientVehicleFlows.PlateAlreadyExists`

---

### Client vehicles and orders

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/clients/{personId}/vehicles` | Admin, Receptionist | Add vehicle to client |
| POST | `/api/vehicles/{vehicleId}/transfer-ownership` | Admin, Receptionist | Transfer ownership — body: `TransferVehicleOwnershipRequest` |
| GET | `/api/clients/{personId}/vehicles` | Admin, Receptionist | List client vehicles |
| GET | `/api/clients/{personId}/service-orders` | Admin, Receptionist | List client service orders |
| GET | `/api/client/my-vehicles` | Client | Own vehicles → `ClientVehicleDto[]` |
| GET | `/api/client/my-service-orders` | Client | Own service orders → `ClientServiceOrderSummaryDto[]` |
| GET | `/api/client/my-invoices` | Client | Own invoices → `ClientInvoiceSummaryDto[]` |

**Source:** `Api/Controllers/ClientVehiclesController.cs`

**Client invoice detail:** Clients **cannot** call `GET /api/invoices/{id}` (`InvoicesController` — Admin, Receptionist only). Use `GET /api/client/my-invoices` for list/summary fields and `GET /api/invoices/{id}/payment-summary` for payment breakdown (ownership enforced).

#### POST /api/clients/{personId}/vehicles

**Auth:** Admin, Receptionist  
**Source:** `Api/Controllers/ClientVehiclesController.cs`, `Application/Features/ClientVehicleFlows/Requests/AddVehicleToClientRequest.cs`

**Request body (`AddVehicleToClientRequest`):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| modelId | int | Yes | > 0 |
| vehicleTypeId | int | Yes | > 0 |
| plate | string | Yes | Same plate rules as vehicle CRUD |
| vin | string? | No | If provided: 17 alphanumeric chars (uppercase) |
| year | int | Yes | 1900 … current UTC year + 1 |
| color | string? | No | Max 30 chars |
| mileage | int | Yes | ≥ 0 |

**Success (200):** `ClientVehicleDto`

**Possible errors:** Same plate/VIN validation as vehicle CRUD (`ClientVehicleFlows.PlateRequired`, `PlateInvalid`, `PlateAlreadyExists`, `VinAlreadyExists`, etc.)

#### POST /api/vehicles/{vehicleId}/transfer-ownership

**Request body (`TransferVehicleOwnershipRequest`):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| newOwnerPersonId | int | Yes | Must be > 0 |
| transferDate | DateTime? | No | Defaults in service if omitted; validated |

**Success (200):** `ClientVehicleDto`

**Source:** `Application/Features/ClientVehicleFlows/Requests/TransferVehicleOwnershipRequest.cs`

---

### Client approvals

#### GET /api/client/pending-approvals

**Auth:** Client  
**Source:** `Api/Controllers/ClientApprovalsController.cs`  
**Success (200):** `PendingApprovalDto` (orderServices[], orderServiceParts[])

#### POST /api/client/approvals/order-services/{id}/approve|reject

#### POST /api/client/approvals/order-service-parts/{id}/approve|reject

**Auth:** Client  
**Success (200):** `ServiceExecutionResultDto` `{ id, entity, action, success }`

---

### Service order workflow

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/service-orders/{id}/full-detail` | Admin, Receptionist, Mechanic, Client | Full order detail with ownership checks for Client |
| POST | `/api/service-orders/{id}/change-status` | Admin, Receptionist | Body: `{ newOrderStatusId, observation? }` |
| POST | `/api/service-orders/{id}/cancel` | Admin, Receptionist | Body: `{ reason, observation? }` |
| POST | `/api/service-orders/{id}/void` | Admin | Body: `{ reason, observation? }` |
| POST | `/api/service-orders/{id}/complete` | Admin, Receptionist, Mechanic | No body |

**Source:** `Api/Controllers/ServiceOrderWorkflowController.cs`  
**Success (200):** `ServiceOrderFullDetailDto` or `ServiceOrderWorkflowDto`

**`ServiceOrderFullDetailDto` vehicle fields:** Includes `vehicleId` (from `ServiceOrderDto`) and **`vehiclePlate`** (string — plate of the linked vehicle at read time; empty string if vehicle not found).

---

### Order service execution (staff)

| Method | Route | Auth | Body |
|--------|-------|------|------|
| PUT | `/api/order-services/{id}/work-report` | Admin, Receptionist, Mechanic | `{ workPerformed?, laborCost? }` |
| POST | `/api/order-services/{id}/assign-mechanic` | Admin, Receptionist | `{ mechanicPersonId, specialtyId }` |
| POST | `/api/order-services/{id}/unassign-mechanic` | Admin, Receptionist | `{ mechanicAssignmentId }` |
| POST | `/api/order-services/{id}/request-part` | Admin, Receptionist, Mechanic | `{ partId, quantity, appliedUnitPrice }` |

**Source:** `Api/Controllers/OrderServiceBusinessController.cs`  
**Success (200):** `ServiceExecutionResultDto`

---

### Order service part business (staff approval)

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/order-service-parts/{id}/approve` | Admin, Receptionist |
| POST | `/api/order-service-parts/{id}/reject` | Admin, Receptionist |
| PUT | `/api/order-service-parts/{id}/change-quantity` | Admin, Receptionist, Mechanic - body: `{ quantity }` |

**Source:** `Api/Controllers/OrderServicePartBusinessController.cs`

---

### Mechanic workflow

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/mechanic/my-assigned-services` | Mechanic → `MechanicAssignedServiceDto[]` |
| GET | `/api/mechanic/my-active-orders` | Mechanic → `MechanicActiveOrderDto[]` |
| PUT | `/api/mechanic/order-services/{id}/work-performed` | Mechanic — body: `UpdateWorkPerformedRequest` |

**`UpdateWorkPerformedRequest`:**

| Field | Type | Notes |
|-------|------|-------|
| workPerformed | string? | |
| laborCost | decimal | Required in model (defaults to 0 if omitted) |

**Source:** `Application/Features/ServiceExecution/Requests/UpdateWorkPerformedRequest.cs`, `MechanicWorkflowController.cs`

**`MechanicAssignedServiceDto`** (scoped to authenticated mechanic via `personId` claim):

| Field | Type | Notes |
|-------|------|-------|
| orderServiceId | int | |
| serviceOrderId | int | |
| vehicleId | int | **No `vehiclePlate`** — plate exists on vehicles but is not projected in this DTO |
| serviceTypeId | int | Resolve label via `GET /api/catalogs/workshop` |
| description | string? | |
| workPerformed | string? | Empty when work report pending |
| laborCost | decimal | |
| customerApproved | bool? | |
| approvalDate | string? (ISO) | |
| specialtyId | int | Assignment specialty |

**Not returned:** `mechanicAssignmentId`, assignment date, order status, vehicle plate.

**`MechanicActiveOrderDto`** (Phase 6.2 — `GET /api/mechanic/my-active-orders`):

| Field | Type |
|-------|------|
| serviceOrderId | int |
| vehicleId | int |
| orderStatusId | int |
| entryDate | string (ISO) |
| estimatedDeliveryDate | string? (ISO) |
| generalDescription | string? |

**Source DTO:** `Application/Features/ServiceExecution/Dtos/MechanicActiveOrderDto.cs` — **no `vehiclePlate`**.

**Frontend (Phase 6.2):** `/mechanic/active-orders` consumes this endpoint only. Order status labels resolve via `GET /api/catalogs/workshop` (`orderStatuses`). Search/filter: order ID, vehicle ID, status, general description. Cards link to Assigned Services for per-service detail (active orders DTO has no `orderServiceId`).

**Frontend (Phase 6.3):** Service detail and record work use `GET /api/mechanic/my-assigned-services` (find row by `orderServiceId`) and `PUT /api/mechanic/order-services/{id}/work-performed`. There is **no** mechanic-specific single-service GET. Do not use `GET /api/service-orders/{id}/full-detail` to enrich mechanic assignment views unless product explicitly opts in (assignment-scoped DTO is the default).

> There is **no** dedicated “work history” list endpoint for mechanics. Use assigned/active endpoints or product decision to filter client-side.

---

### Invoicing

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/invoices/generate-from-service-order/{serviceOrderId}` | Admin, Receptionist | Body: `{ invoiceNumber?, invoiceStatusId?, tax?, observations? }` — **409** if order already has invoice (`InvoiceBusiness.ServiceOrderAlreadyHasInvoiceConflict`) |
| POST | `/api/invoices/{id}/recalculate` | Admin, Receptionist | Recalculate totals |
| POST | `/api/invoices/{id}/issue` | Admin, Receptionist | Issue draft invoice |
| POST | `/api/invoices/{id}/cancel` | Admin | Body: `{ reason }` — **reason required** (non-empty) |
| GET | `/api/invoices/{invoiceId}/details` | Admin, Receptionist | Line items grouped by invoice — prefer over `GET /api/invoice-details` + client filter |

**Source:** `Api/Controllers/InvoiceBusinessController.cs`, `Api/Controllers/InvoicesController.cs`

**Invoice details by invoice (`InvoiceDetailsByInvoiceDto`):** `invoiceId`, `invoiceNumber`, `invoiceStatusId`, `subtotal`, `tax`, `total`, `details[]` where each line has `invoiceDetailId`, `sourcePartId?`, `concept`, `quantity`, `unitPrice`, `subtotal`, `lineType`.

---

### Payments

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/invoices/{id}/record-payment` | Admin, Receptionist | Record payment against invoice |
| GET | `/api/invoices/{id}/payment-summary` | Admin, Receptionist, Client | Payment summary (Client: own invoices only) |
| POST | `/api/payments/{id}/refund` | Admin | Refund completed payment — **no request body**; returns `RecordedPaymentDto` |

**Source:** `Api/Controllers/PaymentBusinessController.cs`

**Record payment body (`RecordPaymentRequest`):**

```json
{
  "paymentMethodId": 1,
  "paymentStatusId": 2,
  "paymentDate": "2026-05-29T10:00:00Z",
  "amount": 150000.00,
  "reference": "REF-001",
  "card": {
    "cardTypeId": 1,
    "lastFourDigits": "4242",
    "cardHolder": "Juan Perez",
    "authorizationCode": "AUTH123"
  }
}
```

---

### Inventory

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/inventory/register-purchase` | Admin, Receptionist |
| GET | `/api/inventory/low-stock` | Admin, Receptionist |
| POST | `/api/inventory/adjust-stock` | Admin |
| GET | `/api/inventory/summary` | Admin, Receptionist |
| POST | `/api/inventory/purchases/{purchaseId}/cancel` | Admin |

**Source:** `Api/Controllers/InventoryBusinessController.cs`

**Cancel purchase (Admin only):** Body `{ "reason": "string" }` (required). Marks purchase cancelled, reverts stock, audits as CANCEL. **409** on double cancel or mutating cancelled purchase via CRUD routes. Response: `InventoryPurchaseCancellationResultDto` (`isCancelled`, `cancelledAt`, `cancellationReason`, `cancelledByUserId`, …).

**Register purchase body (`RegisterInventoryPurchaseRequest`):**

```json
{
  "supplierId": 1,
  "purchaseDate": "2026-05-29T10:00:00Z",
  "details": [
    { "partId": 1, "quantity": 10, "unitPrice": 25.50 }
  ]
}
```

**Success (200):** `InventoryPurchaseResultDto`

**Adjust stock body (`AdjustStockRequest`):**

```json
{
  "partId": 1,
  "adjustmentQuantity": 5,
  "reason": "Physical count correction"
}
```

`adjustmentQuantity` must be non-zero (positive adds stock, negative removes). `changedByUserId` is taken from the JWT `userId` claim (not in request body).

**Success (200):** `InventoryAdjustmentResultDto`

**GET `/api/inventory/summary` success (200):** `InventorySummaryDto`

**GET `/api/inventory/low-stock` success (200):** `LowStockPartDto[]` (parts where `stock <= minimumStock`)

#### Parts (`/api/parts`)

| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/api/parts` | — | `PartDto[]` |
| GET | `/api/parts/{id}` | — | `PartDto` |
| POST | `/api/parts` | `CreatePartRequest` | `PartDto` |
| PUT | `/api/parts/{id}` | `UpdatePartRequest` | `PartDto` |
| DELETE | `/api/parts/{id}` | — | 204 |

**GET `/api/search/parts?term=`** — `PartSearchResultDto[]` (active search; min term length enforced server-side)

#### Suppliers (`/api/suppliers`)

| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/api/suppliers` | — | `SupplierDto[]` |
| GET | `/api/suppliers/{id}` | — | `SupplierDto` |
| POST | `/api/suppliers` | `CreateSupplierRequest` | `SupplierDto` |
| PUT | `/api/suppliers/{id}` | `UpdateSupplierRequest` | `SupplierDto` |
| DELETE | `/api/suppliers/{id}` | — | 204 |

**GET `/api/search/suppliers?term=`** — `SupplierSearchResultDto[]`

#### Part purchases (`/api/part-purchases`, `/api/part-purchase-details`)

| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/api/part-purchases` | — | `PartPurchaseDto[]` |
| GET | `/api/part-purchases/{id}` | — | `PartPurchaseDto` |
| POST | `/api/part-purchases` | `CreatePartPurchaseRequest` | `PartPurchaseDto` |
| PUT | `/api/part-purchases/{id}` | `UpdatePartPurchaseRequest` | `PartPurchaseDto` |
| DELETE | `/api/part-purchases/{id}` | — | 204 |
| GET | `/api/part-purchase-details` | — | `PartPurchaseDetailDto[]` |
| GET | `/api/part-purchase-details/{id}` | — | `PartPurchaseDetailDto` |
| POST | `/api/part-purchase-details` | `CreatePartPurchaseDetailRequest` | `PartPurchaseDetailDto` |
| PUT | `/api/part-purchase-details/{id}` | `UpdatePartPurchaseDetailRequest` | `PartPurchaseDetailDto` |
| DELETE | `/api/part-purchase-details/{id}` | — | 204 |

**Note:** `POST /api/inventory/register-purchase` is the canonical single-transaction flow (header + lines + stock). The Admin **Register purchase** UI uses only this endpoint. Admin cancels via `POST /api/inventory/purchases/{purchaseId}/cancel` (not Receptionist). Cancelled purchases return **409** on PUT/DELETE header or detail mutations. CRUD routes below remain for non-cancelled purchases; purchase history in Admin uses GET/PUT/DELETE on those resources, not POST create for registration.

`PartDto` / `PartSearchResultDto` do **not** include a separate `name` or `partName` field. Use **`description`** as the human-readable catalog label; **`code`** is the part code/SKU.

**Part search display fields (`PartSearchResultDto`):** `partId`, `code`, `description`, `stock`, `minimumStock`, `unitPrice`, `isActive`.

```ts
export interface PartDto {
  partId: number;
  partCategoryId: number;
  partBrandId?: number | null;
  code: string;
  description: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}

export interface CreatePartRequest {
  partCategoryId: number;
  partBrandId?: number | null;
  code?: string;
  description?: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive?: boolean;
}

export interface UpdatePartRequest {
  partCategoryId: number;
  partBrandId?: number | null;
  code?: string;
  description?: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}

export interface LowStockPartDto {
  partId: number;
  partCategoryId: number;
  partBrandId?: number | null;
  code: string;
  description: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}

export interface AdjustStockRequest {
  partId: number;
  adjustmentQuantity: number;
  reason?: string;
}

export interface InventoryAdjustmentResultDto {
  partId: number;
  previousStock: number;
  adjustmentQuantity: number;
  newStock: number;
  reason?: string;
}

export interface RegisterInventoryPurchaseDetailRequest {
  partId: number;
  quantity: number;
  unitPrice: number;
}

export interface RegisterInventoryPurchaseRequest {
  supplierId: number;
  purchaseDate?: string;
  details?: RegisterInventoryPurchaseDetailRequest[];
}

export interface InventoryPurchaseDetailResultDto {
  partPurchaseDetailId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InventoryPurchaseResultDto {
  partPurchaseId: number;
  supplierId: number;
  purchaseDate: string;
  total: number;
  details: InventoryPurchaseDetailResultDto[];
}

export interface SupplierDto {
  supplierId: number;
  name: string;
  taxId?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
}

export interface CreateSupplierRequest {
  name?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateSupplierRequest {
  name?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface PartPurchaseDto {
  partPurchaseId: number;
  supplierId: number;
  purchaseDate: string;
  total: number;
  isCancelled?: boolean;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  cancelledByUserId?: number | null;
}

export interface CancelInventoryPurchaseRequest {
  reason: string;
}

export interface InventoryPurchaseCancellationResultDto {
  partPurchaseId: number;
  supplierId: number;
  purchaseDate: string;
  total: number;
  isCancelled: boolean;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  cancelledByUserId?: number | null;
  message: string;
}

export interface CreatePartPurchaseRequest {
  supplierId: number;
  purchaseDate?: string;
}

export interface UpdatePartPurchaseRequest {
  supplierId: number;
  purchaseDate: string;
}

export interface PartPurchaseDetailDto {
  partPurchaseDetailId: number;
  partPurchaseId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreatePartPurchaseDetailRequest {
  partPurchaseId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
}
```


---

### Staff and users

#### POST /api/staff/register

**Auth:** Admin  
**Source:** `Api/Controllers/StaffController.cs`  
**Body:** `RegisterStaffRequest` (person fields + email + password + roleName + specialtyIds for mechanics)  
**Success (200):** `StaffUserDto` (controller returns `Ok`, not `201`)

#### PUT /api/users/{id}/activate | /deactivate

**Auth:** Admin  
**Source:** `Api/Controllers/UserStatusController.cs`  
**Success (200):** `StaffUserDto`

#### GET/PUT /api/mechanics/{personId}/specialties

**Auth:** GET Admin,Receptionist; PUT Admin  
**Source:** `Api/Controllers/MechanicsController.cs`

---

### Reports (Admin)

All accept optional query params **`from`** and **`to`** (DateTime).

| Route | Response DTO |
|-------|--------------|
| `/api/admin/reports/sales` | SalesReportDto |
| `/api/admin/reports/inventory` | InventoryReportDto |
| `/api/admin/reports/mechanics` | MechanicsReportDto |
| `/api/admin/reports/service-orders` | ServiceOrdersReportDto |
| `/api/admin/reports/payments` | PaymentsReportDto |

**Source:** `Api/Controllers/ReportsController.cs`

---

### Admin audits

| Method | Route | Query/Route params |
|--------|-------|-------------------|
| GET | `/api/admin/audits/recent` | - |
| GET | `/api/admin/audits/by-entity` | `entity`, `recordId` |
| GET | `/api/admin/audits/by-user/{userId}` | Route: userId |

**Source:** `Api/Controllers/AdminAuditQueriesController.cs`  
**Success (200):** `AuditQueryDto[]`

**Read-only audit API:** `GET /api/audits`, `GET /api/audits/{id}`, `GET /api/audit-action-types`, `GET /api/audit-action-types/{id}` only. `POST`/`PUT`/`DELETE` on audits and audit-action-types were removed — do not expose create/edit/delete in Admin UI.

---

### Admin mechanics (aggregate)

| Method | Route | Response |
|--------|-------|----------|
| GET | `/api/admin/mechanics` | `AdminMechanicListItemDto[]` |
| GET | `/api/admin/mechanics/{personId}` | `AdminMechanicDetailDto` |
| GET | `/api/admin/mechanics/{personId}/workload` | `AdminMechanicWorkloadDto` |

**Auth:** Admin only. **Source:** `Api/Controllers/AdminMechanicsController.cs`, `Application/Features/AdminMechanics/`.

List/detail include `personId`, `fullName`, `documentNumber`, `userId`, `email`, `isUserActive`, `roleActive`, `specialties[]`, assignment counts, and enriched workload rows (`vehiclePlate`, `serviceTypeName`, `orderStatusName`, `customerName`, …). Specialty edits remain `PUT /api/mechanics/{personId}/specialties`.

---

## 10. DTOs and TypeScript Types

Suggested interfaces based on backend DTOs. Optional fields (`?`) match nullable C# properties.

### Auth

```ts
export interface AuthUserDto {
  userId: number;
  personId: number;
  email: string;
  isActive: boolean;
  roles: string[];
}

export interface AuthResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUserDto;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface RegisterClientRequest {
  documentTypeId: number;
  documentNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  email?: string;
  phoneCountryId?: number;
  phoneNumber?: string;
  password?: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}
```

### Account

```ts
export interface AccountProfileDto {
  userId: number;
  personId: number;
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  primaryEmail?: string;
  primaryPhoneCountryId?: number;
  primaryPhoneNumber?: string;
  isActive: boolean;
  roles: string[];
}
```

### Catalogs

```ts
export interface CatalogItemDto {
  id: number;
  name: string;
}

export interface PublicRegistrationCatalogsDto {
  documentTypes: CatalogItemDto[];
  genders: CatalogItemDto[];
  countries: CatalogItemDto[];
  departments: CatalogItemDto[];
  cities: CatalogItemDto[];
  streetTypes: CatalogItemDto[];
  neighborhoods: CatalogItemDto[];
}

export interface WorkshopCatalogsDto {
  vehicleTypes: CatalogItemDto[];
  vehicleBrands: CatalogItemDto[];
  vehicleModels: CatalogItemDto[];
  serviceTypes: CatalogItemDto[];
  orderStatuses: CatalogItemDto[];
  invoiceStatuses: CatalogItemDto[];
  paymentMethods: CatalogItemDto[];
  paymentStatuses: CatalogItemDto[];
  cardTypes: CatalogItemDto[];
  mechanicSpecialties: CatalogItemDto[];
  partCategories: CatalogItemDto[];
  partBrands: CatalogItemDto[];
  auditActionTypes: CatalogItemDto[];
}

export interface VehicleBrandDto {
  brandId: number;
  brandName: string;
}

export interface CreateVehicleBrandRequest {
  brandName?: string;
}

export interface UpdateVehicleBrandRequest {
  brandName?: string;
}

export interface VehicleModelDto {
  modelId: number;
  brandId: number;
  modelName: string;
}

export interface CreateVehicleModelRequest {
  brandId: number;
  modelName?: string;
}

export interface UpdateVehicleModelRequest {
  brandId: number;
  modelName?: string;
}

export interface VehicleDto {
  vehicleId: number;
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateVehicleRequest {
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
}

export interface UpdateVehicleRequest {
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
}
```

### Service orders

```ts
export interface ServiceOrderDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  createdAt: string;
}

export interface ServiceOrderInventorySummaryDto {
  entryInventoryId: number;
  hasScratches: boolean;
  scratchesDescription?: string;
  hasToolbox: boolean;
  toolboxDescription?: string;
  ownershipCardDelivered: boolean;
  observations?: string;
  registeredAt: string;
}

export interface ServiceOrderMechanicSummaryDto {
  mechanicAssignmentId: number;
  mechanicPersonId: number;
  specialtyId: number;
}

export interface ServiceOrderPartSummaryDto {
  orderServicePartId: number;
  partId: number;
  quantity: number;
  appliedUnitPrice: number;
  subtotal: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface ServiceOrderServiceSummaryDto {
  orderServiceId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
  mechanics: ServiceOrderMechanicSummaryDto[];
  parts: ServiceOrderPartSummaryDto[];
}

export interface ServiceOrderPaymentSummaryDto {
  paymentId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface ServiceOrderInvoiceSummaryDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  payments: ServiceOrderPaymentSummaryDto[];
}

export interface ServiceOrderFullDetailDto extends ServiceOrderDto {
  vehiclePlate: string;
  inventory?: ServiceOrderInventorySummaryDto;
  services: ServiceOrderServiceSummaryDto[];
  invoice?: ServiceOrderInvoiceSummaryDto;
}

export interface ServiceOrderWorkflowDto {
  serviceOrderId: number;
  previousOrderStatusId: number;
  newOrderStatusId: number;
  orderStatusHistoryId: number;
  cancellationReason?: string;
  cancellationDate?: string;
}

export interface CreateServiceOrderRequest {
  vehicleId: number;
  orderStatusId: number;
  entryDate?: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
}

export interface UpdateServiceOrderRequest {
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  cancellationReason?: string;
  cancellationDate?: string;
}

export interface OrderServiceDto {
  orderServiceId: number;
  serviceOrderId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface CreateOrderServiceRequest {
  serviceOrderId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface UpdateOrderServiceRequest {
  serviceOrderId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
}
```

### Dashboards

```ts
export interface AdminDashboardDto {
  totalUsers: number;
  activeUsers: number;
  totalClients: number;
  totalMechanics: number;
  activeServiceOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  lowStockParts: number;
  totalInvoicedAmount: number;
  totalCompletedPaymentsAmount: number;
  pendingPaymentAmount: number;
}

export interface ReceptionistDashboardDto {
  pendingOrders: number;
  inProgressOrders: number;
  completedOrdersToday: number;
  vehiclesCurrentlyInWorkshop: number;
  pendingInvoices: number;
  lowStockParts: number;
}

export interface MechanicDashboardDto {
  assignedServices: number;
  activeOrders: number;
  pendingWorkReports: number;
  requestedPartsPendingApproval: number;
  activeServiceOrderIds: number[];
}

export interface ClientDashboardDto {
  activeServiceOrders: number;
  pendingApprovals: number;
  pendingInvoices: number;
  totalVehicles: number;
  recentServiceOrderIds: number[];
}
```

### Reports

All report routes accept optional query `from`, `to` (ISO DateTime). `InventoryReportDto` and `MechanicsReportDto` / `ServiceOrdersReportDto` / `PaymentsReportDto` do not echo `from`/`to` in the body; `SalesReportDto` includes them.

```ts
export interface SalesReportDto {
  from?: string;
  to?: string;
  invoiceCount: number;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  issuedInvoices: number;
  cancelledInvoices: number;
}

export interface InventoryReportDto {
  totalParts: number;
  activeParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  estimatedInventoryValue: number;
  purchasesCount: number;
  purchasesAmount: number;
}

export interface MechanicsReportDto {
  totalMechanics: number;
  activeMechanics: number;
  totalAssignments: number;
  servicesWithWorkPerformed: number;
  servicesPendingWorkPerformed: number;
}

export interface ServiceOrdersReportDto {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  voidedOrders: number;
}

export interface PaymentsReportDto {
  totalPayments: number;
  totalAmount: number;
  completedAmount: number;
  refundedAmount: number;
  pendingOrOtherAmount: number;
}
```

### Audits

**Source:** `Application/Features/Audits/Dtos/AuditDto.cs`, `Application/Features/AuditQueries/Dtos/AuditQueryDto.cs`

`AuditQueryDto` has the same properties as `AuditDto`.

```ts
export interface AuditDto {
  auditId: number;
  userId: number;
  auditActionTypeId: number;
  affectedEntity: string;
  affectedRecordId: number;
  description?: string;
  createdAt: string;
}

export type AuditQueryDto = AuditDto;
```

**Admin audit queries**

| Method | Route | Notes |
|--------|-------|-------|
| GET | `/api/admin/audits/recent` | Last **50** records (`AuditQueryService.RecentLimit`) |
| GET | `/api/admin/audits/by-entity` | Query: `entity` (required), `recordId` (required, &gt; 0) |
| GET | `/api/admin/audits/by-user/{userId}` | Route `userId` must exist |

**Read-only** `/api/audits` and `/api/audit-action-types` — Admin list/get only; no API mutations. Admin Audit UI is read-only.

### Search results

```ts
export interface ClientSearchResultDto {
  personId: number;
  documentNumber: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhoneNumber?: string;
}

export interface VehicleSearchResultDto {
  vehicleId: number;
  plate: string;
  vin: string;
  modelId: number;
  vehicleTypeId: number;
  year: number;
  color?: string;
  isActive: boolean;
}

export interface ServiceOrderSearchResultDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  generalDescription?: string;
}

export interface InvoiceSearchResultDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  total: number;
  invoiceDate: string;
}

export interface PartSearchResultDto {
  partId: number;
  code: string;
  description: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}

export interface SupplierSearchResultDto {
  supplierId: number;
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface MechanicSearchResultDto {
  personId: number;
  documentNumber: string;
  fullName: string;
  specialtyIds: number[];
}
```

### Client portal lists

```ts
export interface ClientVehicleDto {
  vehicleId: number;
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
  ownershipStartDate: string;
  ownershipEndDate?: string;
}

export interface ClientServiceOrderSummaryDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  createdAt: string;
}

export interface ClientInvoiceSummaryDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  observations?: string;
}
```

### Pending approvals

```ts
export interface PendingOrderServiceApprovalDto {
  orderServiceId: number;
  serviceOrderId: number;
  vehicleId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
}

export interface PendingOrderServicePartApprovalDto {
  orderServicePartId: number;
  orderServiceId: number;
  serviceOrderId: number;
  vehicleId: number;
  partId: number;
  quantity: number;
  appliedUnitPrice: number;
  subtotal: number;
}

export interface PendingApprovalDto {
  orderServices: PendingOrderServiceApprovalDto[];
  orderServiceParts: PendingOrderServicePartApprovalDto[];
}
```

### Service execution

```ts
export interface ServiceExecutionResultDto {
  id: number;
  entity: string;
  action: string;
  success: boolean;
}

export interface MechanicAssignedServiceDto {
  orderServiceId: number;
  serviceOrderId: number;
  vehicleId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
  specialtyId: number;
}

export interface MechanicActiveOrderDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
}

export interface UpdateWorkPerformedRequest {
  workPerformed?: string;
  laborCost: number;
}
```

### Payments (business)

```ts
export interface PaymentSummaryItemDto {
  paymentId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface PaymentSummaryDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceTotal: number;
  completedPaidAmount: number;
  refundedAmount: number;
  pendingAmount: number;
  payments: PaymentSummaryItemDto[];
}
```

### Workshop / client onboarding / staff

```ts
export interface CreateWorkshopIntakeOrderServiceRequest {
  serviceTypeId: number;
  description?: string;
  laborCost: number;
}

export interface WorkshopIntakeDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryInventoryId: number;
  orderStatusHistoryId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  services: { orderServiceId: number; serviceTypeId: number; description?: string; laborCost: number }[];
}

export interface CreateClientWithVehicleRequest {
  documentTypeId: number;
  documentNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  email?: string;
  phoneCountryId?: number;
  phoneNumber?: string;
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin?: string;
  year: number;
  color?: string;
  mileage: number;
}

export interface AddVehicleToClientRequest {
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin?: string;
  year: number;
  color?: string;
  mileage: number;
}

export interface ClientWithVehicleDto {
  personId: number;
  vehicleId: number;
  vehicleOwnerHistoryId: number;
  documentNumber: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhoneNumber?: string;
  plate: string;
  vin: string;
}

export interface RegisterStaffRequest {
  documentTypeId: number;
  documentNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  email?: string;
  phoneCountryId?: number;
  phoneNumber?: string;
  password?: string;
  roleName?: string;
  specialtyIds?: number[];
}

export interface StaffUserDto {
  userId: number;
  personId: number;
  email: string;
  roleName: string;
  isActive: boolean;
  specialtyIds: number[];
}

export interface TransferVehicleOwnershipRequest {
  newOwnerPersonId: number;
  transferDate?: string;
}

export interface InventorySummaryDto {
  totalParts: number;
  activeParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  estimatedInventoryValue: number;
}

export interface GeneratedInvoiceDetailDto {
  invoiceDetailId: number;
  sourcePartId?: number;
  concept: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  lineType: string;
}

export interface GeneratedInvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  observations?: string;
  details?: GeneratedInvoiceDetailDto[];
}

export interface InvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  observations?: string;
}

export interface CreateInvoiceRequest {
  invoiceNumber?: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate?: string;
  tax: number;
  observations?: string;
}

export interface UpdateInvoiceRequest {
  invoiceNumber?: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  tax: number;
  observations?: string;
}

export interface CancelInvoiceRequest {
  reason?: string;
}

export interface InvoiceBusinessResultDto {
  invoiceId: number;
  action: string;
  success: boolean;
  subtotal: number;
  tax: number;
  total: number;
}

export interface InvoiceDetailDto {
  invoiceDetailId: number;
  invoiceId: number;
  sourcePartId?: number;
  concept: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  lineType: string;
}

export interface PaymentDto {
  paymentId: number;
  invoiceId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface PaymentCardDto {
  paymentCardId: number;
  paymentId: number;
  cardTypeId: number;
  lastFourDigits: string;
  cardHolder: string;
  authorizationCode?: string;
}

export interface RecordedPaymentDto {
  paymentId: number;
  invoiceId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
  paymentCardId?: number;
}
```

### Ownership and access errors (JSON body)

When a **Client** accesses another user's data, the service returns **409 Conflict** (not 403) with:

| Scenario | HTTP | code |
|----------|------|------|
| Service order full detail — not owner's vehicle | 409 | `ServiceOrderWorkflow.ClientCannotAccessServiceOrderConflict` |
| Invoice payment summary — not owner's invoice | 409 | `PaymentBusiness.ClientCannotAccessInvoiceConflict` |

When resource id does not exist: **404** with `*.NotFound` codes (e.g. `ServiceOrderWorkflow.NotFound`, `PaymentBusiness.InvoiceNotFound`).

**Mechanic** accessing unassigned order full detail: **409** `ServiceOrderWorkflow.MechanicCannotAccessServiceOrderConflict`.

### CRUD entity DTOs (index)

Standard resource DTOs follow `{Entity}Dto`, `Create{Entity}Request`, `Update{Entity}Request` under:

`AutoTallerManager-Backend/Application/Features/{Module}/Dtos/` and `.../Requests/`

The backend contains **103** `*Dto.cs` files and matching request types. Section 9 CRUD table lists routes and auth. For code generation, prefer copying from backend source or Swagger over inferring fields.

**Example** `PersonDto` fields match `CreatePersonRequest` in `Application/Features/Persons/`.

### Common error

```ts
export interface ApiError {
  code: string;
  message: string;
}
```

Naming: convert PascalCase C# properties to **camelCase** in TypeScript.

---

## 11. Suggested Frontend API Service Structure

Based on backend modules:

```
src/
  api/
    httpClient.ts           # axios/fetch + auth interceptor + refresh logic
    auth.api.ts
    account.api.ts
    catalogs.api.ts
    dashboards.api.ts
    search.api.ts
    persons.api.ts
    vehicles.api.ts
    clientVehicles.api.ts
    serviceOrders.api.ts
    serviceOrderWorkflow.api.ts
    orderServices.api.ts
    orderServiceParts.api.ts
    workshopIntake.api.ts
    clientApprovals.api.ts
    mechanic.api.ts
    invoices.api.ts
    payments.api.ts
    inventory.api.ts
    parts.api.ts
    suppliers.api.ts
    staff.api.ts
    users.api.ts
    reports.api.ts
    audits.api.ts
  types/
    auth.types.ts
    account.types.ts
    catalogs.types.ts
    serviceOrder.types.ts
    invoice.types.ts
    payment.types.ts
    vehicle.types.ts
    common.types.ts
  hooks/
    useAuth.ts
    useCurrentUser.ts
    useCatalogs.ts
    useServiceOrders.ts
  pages/
  components/
```

---

## 12. Suggested UI Pages and Flows

### Public

| Page | Endpoints | Notes |
|------|-----------|-------|
| **Login** | `POST /api/auth/login` | Redirect by role after login |
| **Register (Client)** | `GET /api/catalogs/public-registration`, `POST /api/auth/register-client` | Multi-step form: identity -> contact -> password |

### Client

| Page | Endpoints |
|------|-----------|
| **Client Dashboard** | `GET /api/client/dashboard` |
| **My Vehicles** | `GET /api/client/my-vehicles` |
| **My Service Orders** | `GET /api/client/my-service-orders`, `GET /api/service-orders/{id}/full-detail` |
| **Pending Approvals** | `GET /api/client/pending-approvals`, approve/reject endpoints |
| **My Invoices** | `GET /api/client/my-invoices`, `GET /api/invoices/{id}/payment-summary` |
| **Account Settings** | `GET/PUT /api/account/me`, `POST /api/account/change-password` |

### Receptionist

| Page | Endpoints |
|------|-----------|
| **Receptionist Dashboard** | `GET /api/receptionist/dashboard` |
| **Client Search** | `GET /api/search/clients` |
| **Create Client + Vehicle** | `POST /api/receptionist/create-client-with-vehicle` |
| **Workshop Intake** | `POST /api/workshop-intake/create-service-order`, `GET /api/catalogs/workshop` |
| **Service Order Management** | CRUD + workflow + assign mechanic + record payments |

### Mechanic

| Page | Endpoints |
|------|-----------|
| **Mechanic Dashboard** | `GET /api/mechanic/dashboard` |
| **Assigned Services** | `GET /api/mechanic/my-assigned-services` |
| **Active Orders** | `GET /api/mechanic/my-active-orders` |
| **Work Report** | `PUT /api/mechanic/order-services/{id}/work-performed` |
| **Request Parts** | `GET /api/search/parts?term=`, `POST /api/order-services/{id}/request-part` |
| **Search Parts** | `GET /api/search/parts?term=` (Mechanic read-only) |

### Admin

| Page | Endpoints |
|------|-----------|
| **Admin Dashboard** | `GET /api/admin/dashboard` |
| **Staff Management** | `POST /api/staff/register`, `PUT /api/users/{id}/activate|deactivate` |
| **Catalog Admin** | CRUD on lookup tables |
| **Inventory** | `/api/inventory/*`, `/api/parts` |
| **Reports** | `/api/admin/reports/*` |
| **Audits** | `/api/admin/audits/*` |

---

## 13. Role-Based UI Behavior

| Role | Suggested UI access |
|------|---------------------|
| **Admin** | Full access: users, catalogs, inventory adjustments, void orders, cancel invoices, refunds, reports, audits |
| **Receptionist** | Clients, vehicles, intake, service orders, assignments, staff approvals for parts, invoicing, payments (not void/refund/adjust-stock) |
| **Mechanic** | Own dashboard, assigned services, work reports, part requests, search parts/orders, view order full-detail |
| **Client** | Own dashboard, vehicles, orders, invoices, pending approvals, account profile; no staff/admin screens |

Route guards should check JWT `roles` claim array. Backend enforces roles independently - UI hiding is not sufficient for security.

---

## 14. Data Fetching Strategy

- Use **TanStack Query (React Query)** for server state.
- **Auth token:** attach in query/mutation `meta` or HTTP client interceptor.
- **Cache keys:** e.g. `['service-orders']`, `['service-order', id]`, `['client', 'dashboard']`.
- **Invalidate after mutations:**
  - Intake -> invalidate service orders, receptionist dashboard
  - Status change -> invalidate order detail, dashboards
  - Payment -> invalidate invoice, payment-summary, admin dashboard
  - Approvals -> invalidate pending-approvals, client dashboard
- **Loading/empty/error:** standard query states; parse `{ code, message }` on errors.
- **Optimistic updates:** suitable for approval actions; avoid for payments/inventory without confirmation.
- **Lists:** no pagination - consider client-side filtering for large datasets until backend adds pagination.

---

## 15. Forms and Validation Notes

### Client registration / staff registration

| Field | Backend rule | Frontend hint |
|-------|--------------|---------------|
| password | 8-100 chars | Show strength meter, min 8 |
| email | Valid format with domain containing `.` | Standard email input |
| documentNumber | Required, max 30 | |
| phoneNumber | If provided: country required, digits only | E.164-style optional |

### Workshop intake

- Require `vehicleId` and at least one service in `services[]`.
- Capture entry inventory checklist (scratches, toolbox, ownership card).

### Record payment

- Require `paymentMethodId`, `amount`.
- If method is Card (id=2), collect `card` details.

### Change service order status

- Require `newOrderStatusId`; optional `observation` for audit trail.

---

## 16. Error Handling Guide for Frontend

| Status | Meaning | Frontend action |
|--------|---------|-----------------|
| **400** | Validation or business rule failure | Show `message`; map known `code` values to field hints where possible |
| **401** | Missing/expired token | Attempt refresh; redirect to login if refresh fails |
| **403** | Wrong role | Show access denied; do not retry |
| **404** | Resource not found | Show not found state; check route IDs |
| **409** | Conflict (duplicate, in use) | Show conflict message; prompt correction |
| **500** | Server error | Generic error; allow retry; log `code` if present |

ASP.NET **401/403** from auth middleware may not include `{ code, message }` JSON body.

**Ownership violations** for Client/Mechanic scoped reads return **409** with structured `code` (see Section 10 — Ownership and access errors).

| Business rule | HTTP | Example code |
|---------------|------|----------------|
| Generate invoice when order already has one | 409 | `InvoiceBusiness.ServiceOrderAlreadyHasInvoiceConflict` |
| Duplicate invoice number | 409 | `InvoiceBusiness.InvoiceNumberAlreadyExists` |

---

## 17. Remaining gaps (see also `docs/requirements/open-questions.md`)

Resolved from backend source (2026-05-29): Authorization `Bearer` prefix, dev base URL, pagination/filtering rules, dashboard/report/search/client DTO shapes, ownership error codes, transfer ownership body, `UpdateWorkPerformedRequest`, invoice-already-exists conflict code, validation format (single error object).

Still outstanding:

1. **Production CORS origins** — only localhost in `Program.cs`; deployment config not in repo.
2. **Rate limiting** — not implemented in backend.
3. **Server-side pagination** — types exist; no roadmap in code.
4. **Admin Settings API** — no settings module.
5. **Notifications API** — not implemented.
6. **Mechanic work history endpoint** — not implemented.
7. **Client POST vehicle** — not implemented.

---

## 18. Recommended Next Steps for Frontend Development

1. Create environment config (`VITE_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`).
2. Implement HTTP client with JWT interceptor and refresh-token rotation.
3. Build auth service and `useAuth` hook (login, register, logout, refresh).
4. Generate/copy TypeScript types from Section 10 and DTO source files.
5. Create role-based layout and protected routes.
6. Build public registration + login pages using catalog endpoint.
7. Implement role dashboards (Client, Receptionist, Mechanic, Admin).
8. Build core workshop flow: intake -> assign mechanic -> work -> approvals -> invoice -> payment.
9. Add search components for receptionist/admin modules.
10. Implement global error handler and toast notifications from `{ code, message }`.
11. Run backend E2E script (`tools/e2e/run-phase37-e2e.ps1`) against local API to validate integrations.

---

*Generated from AutoTallerManager backend source. Last updated: 2026-05-29.*
