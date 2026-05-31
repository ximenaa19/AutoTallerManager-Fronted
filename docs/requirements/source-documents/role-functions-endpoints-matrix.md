# AutoTallerManager - Matriz de Funciones, Páginas y Endpoints por Rol

Este documento relaciona las funciones principales que debe cumplir cada rol del sistema con las páginas sugeridas del frontend y los endpoints disponibles en el backend.

## Roles del sistema

| Rol | Enfoque principal |
|---|---|
| **Admin** | Administración completa del sistema, usuarios, roles, catálogos, reportes, auditoría y control operativo. |
| **Receptionist** | Operación diaria del taller: clientes, vehículos, órdenes, asignaciones, inventario, facturación y pagos. |
| **Mechanic** | Ejecución técnica: ver órdenes asignadas, reportar trabajo y solicitar repuestos. |
| **Client** | Portal del cliente: ver vehículos, órdenes, facturas y aprobar o rechazar servicios/repuestos. |

---

# 0. Funciones compartidas por todos los roles

Estas páginas existen antes o después del login.

| Página | Función | Endpoints |
|---|---|---|
| Login | Iniciar sesión | `POST /api/auth/login` |
| Registro cliente | Registrar cliente externo | `GET /api/catalogs/public-registration` / `POST /api/auth/register-client` |
| Perfil | Ver perfil del usuario autenticado | `GET /api/account/me` |
| Editar perfil | Actualizar datos propios | `PUT /api/account/me` |
| Cambiar contraseña | Cambiar contraseña propia | `POST /api/account/change-password` |
| Sesión | Renovar token / cerrar sesión | `POST /api/auth/refresh` / `POST /api/auth/logout` |

---

# 1. Admin

El Admin tiene el panel más completo. Es quien administra usuarios, roles, catálogos, reportes, auditoría y también puede operar órdenes si lo necesita.

## 1.1 Dashboard Admin

| Función | Endpoint |
|---|---|
| Ver resumen general del taller | `GET /api/admin/dashboard` |
| Ver usuarios totales / activos | `GET /api/admin/dashboard` |
| Ver clientes totales | `GET /api/admin/dashboard` |
| Ver mecánicos totales | `GET /api/admin/dashboard` |
| Ver órdenes activas / pendientes / en proceso / completadas | `GET /api/admin/dashboard` |
| Ver repuestos con bajo stock | `GET /api/admin/dashboard` |
| Ver montos facturados / pagos / pendientes | `GET /api/admin/dashboard` |

## 1.2 Usuarios

| Función | Endpoint |
|---|---|
| Listar usuarios | `GET /api/users` |
| Ver usuario por ID | `GET /api/users/{id}` |
| Crear usuario | `POST /api/users` |
| Editar usuario | `PUT /api/users/{id}` |
| Eliminar usuario | `DELETE /api/users/{id}` |
| Activar usuario | `PUT /api/users/{id}/activate` |
| Desactivar usuario | `PUT /api/users/{id}/deactivate` |

## 1.3 Staff

| Función | Endpoint |
|---|---|
| Registrar recepcionista | `POST /api/staff/register` |
| Registrar mecánico | `POST /api/staff/register` |
| Consultar especialidades de mecánico | `GET /api/mechanics/{personId}/specialties` |
| Reemplazar especialidades de mecánico | `PUT /api/mechanics/{personId}/specialties` |

## 1.4 Roles y permisos

| Función | Endpoint |
|---|---|
| Listar roles | `GET /api/roles` |
| Crear rol | `POST /api/roles` |
| Editar rol | `PUT /api/roles/{id}` |
| Eliminar rol | `DELETE /api/roles/{id}` |
| Listar roles asignados a personas | `GET /api/person-roles` |
| Asignar rol a persona | `POST /api/person-roles` |
| Editar asignación de rol | `PUT /api/person-roles/{id}` |
| Eliminar asignación de rol | `DELETE /api/person-roles/{id}` |

## 1.5 Catálogos

| Página / catálogo | Endpoints |
|---|---|
| Tipos de documento | `/api/document-types` |
| Géneros | `/api/genders` |
| Tipos de vía | `/api/street-types` |
| Tipos de vehículo | `/api/vehicle-types` |
| Marcas de vehículo | `/api/vehicle-brands` |
| Modelos de vehículo | `/api/vehicle-models` |
| Tipos de servicio | `/api/service-types` |
| Especialidades mecánicas | `/api/mechanic-specialties` |
| Categorías de repuestos | `/api/part-categories` |
| Marcas de repuestos | `/api/part-brands` |
| Métodos de pago | `/api/payment-methods` |
| Estados de pago | `/api/payment-statuses` |
| Estados de factura | `/api/invoice-statuses` |
| Estados de orden | `/api/order-statuses` |
| Tipos de tarjeta | `/api/card-types` |
| Acciones de auditoría | `/api/audit-action-types` |
| Países | `/api/countries` |
| Departamentos | `/api/departments` |
| Ciudades | `/api/cities` |
| Barrios | `/api/neighborhoods` |
| Dominios de correo | `/api/email-domains` |

Cada uno de estos catálogos normalmente consume:

```txt
GET /api/recurso
GET /api/recurso/{id}
POST /api/recurso
PUT /api/recurso/{id}
DELETE /api/recurso/{id}
```

## 1.6 Clientes

| Función | Endpoint |
|---|---|
| Buscar clientes | `GET /api/search/clients?term=` |
| Listar personas/clientes | `GET /api/persons` |
| Ver persona por ID | `GET /api/persons/{id}` |
| Crear persona | `POST /api/persons` |
| Editar persona | `PUT /api/persons/{id}` |
| Eliminar persona | `DELETE /api/persons/{id}` |
| Crear cliente con vehículo | `POST /api/receptionist/create-client-with-vehicle` |
| Ver vehículos de cliente | `GET /api/clients/{personId}/vehicles` |
| Ver órdenes de cliente | `GET /api/clients/{personId}/service-orders` |
| Agregar vehículo a cliente | `POST /api/clients/{personId}/vehicles` |

## 1.7 Vehículos

| Función | Endpoint |
|---|---|
| Buscar vehículos | `GET /api/search/vehicles?term=` |
| Listar vehículos | `GET /api/vehicles` |
| Ver vehículo por ID | `GET /api/vehicles/{id}` |
| Crear vehículo | `POST /api/vehicles` |
| Editar vehículo | `PUT /api/vehicles/{id}` |
| Eliminar vehículo | `DELETE /api/vehicles/{id}` |
| Transferir propiedad | `POST /api/vehicles/{vehicleId}/transfer-ownership` |
| Ver historial de propietarios | `GET /api/vehicle-owner-histories` |
| Gestionar inventario de ingreso | `GET /api/vehicle-entry-inventories` |

## 1.8 Órdenes de servicio

| Función | Endpoint |
|---|---|
| Buscar órdenes | `GET /api/search/service-orders?term=` |
| Crear orden con inventario y servicios | `POST /api/workshop-intake/create-service-order` |
| Listar órdenes | `GET /api/service-orders` |
| Ver orden por ID | `GET /api/service-orders/{id}` |
| Ver detalle completo de orden | `GET /api/service-orders/{id}/full-detail` |
| Cambiar estado | `POST /api/service-orders/{id}/change-status` |
| Cancelar orden | `POST /api/service-orders/{id}/cancel` |
| Anular orden | `POST /api/service-orders/{id}/void` |
| Completar orden | `POST /api/service-orders/{id}/complete` |
| Ver historial de estados | `GET /api/order-status-histories` |

## 1.9 Servicios dentro de una orden

| Función | Endpoint |
|---|---|
| Listar servicios de órdenes | `GET /api/order-services` |
| Ver servicio por ID | `GET /api/order-services/{id}` |
| Crear servicio manualmente | `POST /api/order-services` |
| Editar servicio | `PUT /api/order-services/{id}` |
| Eliminar servicio | `DELETE /api/order-services/{id}` |
| Asignar mecánico | `POST /api/order-services/{id}/assign-mechanic` |
| Quitar mecánico | `POST /api/order-services/{id}/unassign-mechanic` |
| Registrar reporte de trabajo | `PUT /api/order-services/{id}/work-report` |
| Solicitar repuesto | `POST /api/order-services/{id}/request-part` |

## 1.10 Inventario

| Función | Endpoint |
|---|---|
| Ver resumen de inventario | `GET /api/inventory/summary` |
| Ver bajo stock | `GET /api/inventory/low-stock` |
| Ajustar stock manualmente | `POST /api/inventory/adjust-stock` |
| Registrar compra de inventario | `POST /api/inventory/register-purchase` |
| Listar repuestos | `GET /api/parts` |
| Crear repuesto | `POST /api/parts` |
| Editar repuesto | `PUT /api/parts/{id}` |
| Eliminar repuesto | `DELETE /api/parts/{id}` |
| Buscar repuestos | `GET /api/search/parts?term=` |

## 1.11 Compras y proveedores

| Función | Endpoint |
|---|---|
| Listar proveedores | `GET /api/suppliers` |
| Crear proveedor | `POST /api/suppliers` |
| Editar proveedor | `PUT /api/suppliers/{id}` |
| Eliminar proveedor | `DELETE /api/suppliers/{id}` |
| Buscar proveedores | `GET /api/search/suppliers?term=` |
| Listar compras | `GET /api/part-purchases` |
| Crear compra | `POST /api/part-purchases` |
| Ver detalles de compra | `GET /api/part-purchase-details` |
| Registrar compra con inventario | `POST /api/inventory/register-purchase` |

## 1.12 Facturación

| Función | Endpoint |
|---|---|
| Buscar facturas | `GET /api/search/invoices?term=` |
| Listar facturas | `GET /api/invoices` |
| Ver factura por ID | `GET /api/invoices/{id}` |
| Crear factura manual | `POST /api/invoices` |
| Editar factura | `PUT /api/invoices/{id}` |
| Eliminar factura | `DELETE /api/invoices/{id}` |
| Generar factura desde orden | `POST /api/invoices/generate-from-service-order/{serviceOrderId}` |
| Recalcular factura | `POST /api/invoices/{id}/recalculate` |
| Emitir factura | `POST /api/invoices/{id}/issue` |
| Cancelar factura | `POST /api/invoices/{id}/cancel` |
| Ver detalle de factura | `GET /api/invoice-details` |

## 1.13 Pagos

| Función | Endpoint |
|---|---|
| Listar pagos | `GET /api/payments` |
| Ver pago por ID | `GET /api/payments/{id}` |
| Registrar pago | `POST /api/invoices/{id}/record-payment` |
| Ver resumen de pago | `GET /api/invoices/{id}/payment-summary` |
| Reembolsar pago | `POST /api/payments/{id}/refund` |
| Ver tarjetas de pago | `GET /api/payment-cards` |

## 1.14 Reportes

| Función | Endpoint |
|---|---|
| Reporte de ventas | `GET /api/admin/reports/sales` |
| Reporte de inventario | `GET /api/admin/reports/inventory` |
| Reporte de mecánicos | `GET /api/admin/reports/mechanics` |
| Reporte de órdenes | `GET /api/admin/reports/service-orders` |
| Reporte de pagos | `GET /api/admin/reports/payments` |

## 1.15 Auditoría

| Función | Endpoint |
|---|---|
| Listar auditorías | `GET /api/audits` |
| Ver auditoría por ID | `GET /api/audits/{id}` |
| Ver auditorías recientes | `GET /api/admin/audits/recent` |
| Buscar auditoría por entidad | `GET /api/admin/audits/by-entity?entity=&recordId=` |
| Buscar auditoría por usuario | `GET /api/admin/audits/by-user/{userId}` |

---

# 2. Receptionist

La recepcionista necesita operar el taller: clientes, vehículos, órdenes, mecánicos, inventario, facturas y pagos.

## 2.1 Dashboard Recepción

| Función | Endpoint |
|---|---|
| Ver resumen de recepción | `GET /api/receptionist/dashboard` |

## 2.2 Buscador operativo

| Función | Endpoint |
|---|---|
| Buscar clientes | `GET /api/search/clients?term=` |
| Buscar vehículos | `GET /api/search/vehicles?term=` |
| Buscar órdenes | `GET /api/search/service-orders?term=` |
| Buscar facturas | `GET /api/search/invoices?term=` |
| Buscar repuestos | `GET /api/search/parts?term=` |
| Buscar proveedores | `GET /api/search/suppliers?term=` |
| Buscar mecánicos | `GET /api/search/mechanics?term=` |

## 2.3 Clientes

| Función | Endpoint |
|---|---|
| Crear cliente con vehículo | `POST /api/receptionist/create-client-with-vehicle` |
| Ver clientes | `GET /api/persons` |
| Ver cliente por ID | `GET /api/persons/{id}` |
| Editar cliente | `PUT /api/persons/{id}` |
| Ver vehículos de cliente | `GET /api/clients/{personId}/vehicles` |
| Ver órdenes de cliente | `GET /api/clients/{personId}/service-orders` |

## 2.4 Vehículos

| Función | Endpoint |
|---|---|
| Agregar vehículo a cliente | `POST /api/clients/{personId}/vehicles` |
| Transferir propiedad | `POST /api/vehicles/{vehicleId}/transfer-ownership` |
| Ver vehículos | `GET /api/vehicles` |
| Ver vehículo por ID | `GET /api/vehicles/{id}` |
| Editar vehículo | `PUT /api/vehicles/{id}` |

## 2.5 Crear orden

| Función | Endpoint |
|---|---|
| Obtener catálogos de taller | `GET /api/catalogs/workshop` |
| Buscar cliente | `GET /api/search/clients?term=` |
| Buscar vehículo | `GET /api/search/vehicles?term=` |
| Crear orden completa inicial | `POST /api/workshop-intake/create-service-order` |

El endpoint de creación de orden crea en una sola acción la orden, inventario de entrada, historial inicial y servicios solicitados. El request incluye una lista `Services` con `ServiceTypeId`, `Description` y `LaborCost`.

## 2.6 Detalle de orden

| Función | Endpoint |
|---|---|
| Ver detalle completo | `GET /api/service-orders/{id}/full-detail` |
| Cambiar estado | `POST /api/service-orders/{id}/change-status` |
| Cancelar orden | `POST /api/service-orders/{id}/cancel` |
| Completar orden | `POST /api/service-orders/{id}/complete` |
| Ver historial de estados | `GET /api/order-status-histories` |

## 2.7 Asignar mecánico

| Función | Endpoint |
|---|---|
| Buscar mecánicos | `GET /api/search/mechanics?term=` |
| Ver especialidades de mecánico | `GET /api/mechanics/{personId}/specialties` |
| Asignar mecánico a servicio | `POST /api/order-services/{id}/assign-mechanic` |
| Quitar mecánico de servicio | `POST /api/order-services/{id}/unassign-mechanic` |

## 2.8 Inventario

| Función | Endpoint |
|---|---|
| Ver resumen inventario | `GET /api/inventory/summary` |
| Ver bajo stock | `GET /api/inventory/low-stock` |
| Buscar repuestos | `GET /api/search/parts?term=` |
| Listar repuestos | `GET /api/parts` |
| Registrar compra | `POST /api/inventory/register-purchase` |
| Ver proveedores | `GET /api/suppliers` |
| Buscar proveedores | `GET /api/search/suppliers?term=` |

## 2.9 Facturación y pagos

| Función | Endpoint |
|---|---|
| Buscar facturas | `GET /api/search/invoices?term=` |
| Generar factura desde orden | `POST /api/invoices/generate-from-service-order/{serviceOrderId}` |
| Recalcular factura | `POST /api/invoices/{id}/recalculate` |
| Emitir factura | `POST /api/invoices/{id}/issue` |
| Registrar pago | `POST /api/invoices/{id}/record-payment` |
| Ver resumen de pago | `GET /api/invoices/{id}/payment-summary` |

---

# 3. Mechanic

El mecánico debe ver solo lo asignado, registrar trabajo y solicitar repuestos.

## 3.1 Dashboard Mecánico

| Función | Endpoint |
|---|---|
| Ver resumen del mecánico | `GET /api/mechanic/dashboard` |

## 3.2 Mis servicios asignados

| Función | Endpoint |
|---|---|
| Ver servicios asignados | `GET /api/mechanic/my-assigned-services` |
| Ver órdenes activas asignadas | `GET /api/mechanic/my-active-orders` |
| Ver detalle de orden asignada | `GET /api/service-orders/{id}/full-detail` |

## 3.3 Registrar trabajo

| Función | Endpoint |
|---|---|
| Registrar trabajo realizado | `PUT /api/mechanic/order-services/{id}/work-performed` |
| Registrar/editar reporte de trabajo | `PUT /api/order-services/{id}/work-report` |

## 3.4 Solicitar repuestos

| Función | Endpoint |
|---|---|
| Ver catálogo de taller | `GET /api/catalogs/workshop` |
| Buscar repuestos | `GET /api/search/parts?term=` |
| Solicitar repuesto | `POST /api/order-services/{id}/request-part` |
| Cambiar cantidad de repuesto | `PUT /api/order-service-parts/{id}/change-quantity` |

---

# 4. Client

El cliente solo debe ver información propia y aprobar o rechazar servicios/repuestos.

## 4.1 Dashboard Cliente

| Función | Endpoint |
|---|---|
| Ver resumen del cliente | `GET /api/client/dashboard` |

## 4.2 Mis vehículos

| Función | Endpoint |
|---|---|
| Ver mis vehículos | `GET /api/client/my-vehicles` |

## 4.3 Mis órdenes

| Función | Endpoint |
|---|---|
| Ver mis órdenes | `GET /api/client/my-service-orders` |
| Ver detalle de una orden propia | `GET /api/service-orders/{id}/full-detail` |

## 4.4 Aprobaciones pendientes

| Función | Endpoint |
|---|---|
| Ver aprobaciones pendientes | `GET /api/client/pending-approvals` |
| Aprobar servicio | `POST /api/client/approvals/order-services/{id}/approve` |
| Rechazar servicio | `POST /api/client/approvals/order-services/{id}/reject` |
| Aprobar repuesto | `POST /api/client/approvals/order-service-parts/{id}/approve` |
| Rechazar repuesto | `POST /api/client/approvals/order-service-parts/{id}/reject` |

## 4.5 Mis facturas y pagos

| Función | Endpoint |
|---|---|
| Ver mis facturas | `GET /api/client/my-invoices` |
| Ver resumen de pago de factura propia | `GET /api/invoices/{id}/payment-summary` |

## 4.6 Mi perfil

| Función | Endpoint |
|---|---|
| Ver perfil | `GET /api/account/me` |
| Editar perfil | `PUT /api/account/me` |
| Cambiar contraseña | `POST /api/account/change-password` |

---

# 5. Resumen por página principal

## Admin

| Página | Endpoints clave |
|---|---|
| Dashboard Admin | `GET /api/admin/dashboard` |
| Usuarios | `/api/users` |
| Staff | `POST /api/staff/register`, `GET/PUT /api/mechanics/{personId}/specialties` |
| Roles | `/api/roles`, `/api/person-roles` |
| Catálogos | `/api/document-types`, `/api/service-types`, `/api/vehicle-brands`, `/api/part-categories`, etc. |
| Clientes | `/api/persons`, `/api/search/clients`, `/api/clients/{personId}/vehicles` |
| Vehículos | `/api/vehicles`, `/api/search/vehicles` |
| Órdenes | `/api/service-orders`, `/api/workshop-intake/create-service-order`, `/api/service-orders/{id}/full-detail` |
| Mecánicos | `/api/search/mechanics`, `/api/mechanics/{personId}/specialties` |
| Inventario | `/api/inventory/summary`, `/api/inventory/low-stock`, `/api/inventory/adjust-stock`, `/api/parts` |
| Compras | `/api/inventory/register-purchase`, `/api/part-purchases`, `/api/suppliers` |
| Facturación | `/api/invoices`, `/api/invoices/generate-from-service-order/{serviceOrderId}` |
| Pagos | `/api/payments`, `/api/invoices/{id}/record-payment`, `/api/payments/{id}/refund` |
| Reportes | `/api/admin/reports/*` |
| Auditoría | `/api/audits`, `/api/admin/audits/*` |

## Receptionist

| Página | Endpoints clave |
|---|---|
| Dashboard Recepción | `GET /api/receptionist/dashboard` |
| Clientes | `POST /api/receptionist/create-client-with-vehicle`, `/api/search/clients` |
| Vehículos | `POST /api/clients/{personId}/vehicles`, `/api/search/vehicles` |
| Nueva orden | `GET /api/catalogs/workshop`, `POST /api/workshop-intake/create-service-order` |
| Órdenes activas | `/api/search/service-orders`, `GET /api/service-orders/{id}/full-detail` |
| Asignar mecánico | `/api/search/mechanics`, `POST /api/order-services/{id}/assign-mechanic` |
| Inventario | `/api/inventory/summary`, `/api/inventory/low-stock`, `/api/search/parts` |
| Compras | `/api/inventory/register-purchase`, `/api/search/suppliers` |
| Facturación | `/api/invoices/generate-from-service-order/{serviceOrderId}`, `/api/invoices/{id}/issue` |
| Pagos | `/api/invoices/{id}/record-payment`, `/api/invoices/{id}/payment-summary` |

## Mechanic

| Página | Endpoints clave |
|---|---|
| Dashboard Mecánico | `GET /api/mechanic/dashboard` |
| Mis servicios | `GET /api/mechanic/my-assigned-services` |
| Mis órdenes | `GET /api/mechanic/my-active-orders` |
| Detalle servicio | `GET /api/service-orders/{id}/full-detail` |
| Registrar trabajo | `PUT /api/mechanic/order-services/{id}/work-performed` |
| Solicitar repuesto | `GET /api/search/parts?term=`, `POST /api/order-services/{id}/request-part` |
| Cambiar cantidad repuesto | `PUT /api/order-service-parts/{id}/change-quantity` |

## Client

| Página | Endpoints clave |
|---|---|
| Dashboard Cliente | `GET /api/client/dashboard` |
| Mis vehículos | `GET /api/client/my-vehicles` |
| Mis órdenes | `GET /api/client/my-service-orders` |
| Detalle orden | `GET /api/service-orders/{id}/full-detail` |
| Aprobaciones | `GET /api/client/pending-approvals`, `POST /api/client/approvals/...` |
| Mis facturas | `GET /api/client/my-invoices` |
| Detalle factura / pago | `GET /api/invoices/{id}/payment-summary` |
| Perfil | `GET /api/account/me`, `PUT /api/account/me`, `POST /api/account/change-password` |
