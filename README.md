# AutoTallerManager Frontend

AutoTallerManager Frontend es la interfaz web del sistema integral de gestión de un taller automotriz. Este repositorio contiene la aplicación React/Vite/TypeScript usada por los roles Admin, Mechanic, Receptionist y Client para operar módulos de clientes, vehículos, órdenes de servicio, inventario, compras, facturación, pagos y aprobaciones.

**Backend:** https://github.com/MLahitton/AutoTallerManager-Backend

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Roles disponibles](#roles-disponibles)
- [Stack técnico](#stack-técnico)
- [Arquitectura del frontend](#arquitectura-del-frontend)
- [Rutas principales](#rutas-principales)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecutar en desarrollo](#ejecutar-en-desarrollo)
- [Build y lint](#build-y-lint)
- [Guía de flujos por rol](#guía-de-flujos-por-rol)
- [Flujo integral de negocio](#flujo-integral-de-negocio)
- [Permisos y navegación](#permisos-y-navegación)
- [Relación con el backend](#relación-con-el-backend)
- [Validación rápida del frontend](#validación-rápida-del-frontend)
- [Troubleshooting](#troubleshooting)
- [Estado del proyecto](#estado-del-proyecto)
- [Buenas prácticas](#buenas-prácticas)

## Descripción general

El frontend permite probar y operar la gestión diaria de un taller automotriz desde interfaces separadas por rol. La aplicación trabaja con:

- Administración general.
- Mecánicos y asignaciones operativas.
- Recepción del taller.
- Portal de clientes.
- Órdenes de servicio.
- Vehículos.
- Inventario y compras.
- Facturación y pagos.
- Aprobaciones de servicios y repuestos.

La aplicación consume una API REST real a través de un cliente HTTP centralizado y requiere que el backend esté corriendo para cargar catálogos, autenticación, datos operativos y reglas de negocio.

## Roles disponibles

### Admin

Rol administrativo completo. Tiene acceso a usuarios, staff, roles, catálogos, clientes, vehículos, órdenes de servicio, mecánicos, inventario, compras, facturación, pagos, reportes y auditoría.

### Mechanic

Rol operativo del mecánico. Permite revisar servicios asignados, órdenes activas, detalle de servicio, registrar trabajo realizado, solicitar repuestos y buscar repuestos.

### Receptionist

Rol de recepción y operación del taller. Permite crear clientes y vehículos, crear órdenes de servicio, consultar órdenes activas, revisar inventario, registrar compras, generar facturas y registrar pagos.

### Client

Portal de cliente. Es principalmente consultivo y permite revisar vehículos propios, órdenes propias, facturas propias y aprobar o rechazar servicios/repuestos pendientes.

## Stack técnico

Versiones leídas desde `package.json`:

- React `^19.0.0`.
- React DOM `^19.0.0`.
- TypeScript `~5.7.2`.
- Vite `^6.2.0`.
- React Router DOM `^7.16.0`.
- Tailwind CSS `^4.0.9` con `@tailwindcss/vite`.
- ESLint `^9.21.0`.
- pnpm como gestor de paquetes.
- `lucide-react` para iconografía.
- `clsx` y `tailwind-merge` para composición de clases.

## Arquitectura del frontend

El proyecto está organizado por módulos y responsabilidades:

- `src/features/admin`: funcionalidades administrativas.
- `src/features/mechanic`: funcionalidades del mecánico.
- `src/features/receptionist`: funcionalidades de recepción.
- `src/features/client`: portal de cliente.
- `src/features/auth`: autenticación y registro.
- `src/features/account`: perfil y cambio de contraseña.
- `src/components`: componentes compartidos de layout, feedback, dashboard y UI.
- `src/routes`: rutas, navegación, guards, lazy loading y constantes de path.
- `src/api`: cliente HTTP central y APIs transversales.
- `src/hooks`: hooks compartidos.
- `src/lib`: utilidades de sesión, entorno y roles.
- `src/types`: tipos compartidos.
- `src/utils`: utilidades generales.
- `src/pages/dashboards`: dashboards compartidos o legacy por rol.

Cada rol está modularizado en su carpeta cuando aplica. Las rutas principales usan lazy loading mediante `lazyRoute(...)`, `RouteSuspense` y exports desde `src/routes/lazyPages.tsx`.

El consumo de API se centraliza en `src/api/httpClient.ts`, que construye URLs con `VITE_API_BASE_URL`, agrega token Bearer cuando corresponde, intenta refrescar sesión ante `401` y normaliza errores de red/API.

## Rutas principales

Las rutas están definidas en `src/routes/routePaths.ts` y conectadas en `src/routes/router.tsx`.

### Públicas y cuenta

| Ruta | Propósito |
| --- | --- |
| `/login` | Inicio de sesión |
| `/register-client` | Registro público de cliente |
| `/select-role` | Selección de rol cuando el usuario tiene más de uno |
| `/forbidden` | Acceso denegado |
| `/account/profile` | Perfil de cuenta |
| `/account/change-password` | Cambio de contraseña |

### Admin

| Ruta | Propósito |
| --- | --- |
| `/admin/dashboard` | Dashboard administrativo |
| `/admin/users` | Usuarios |
| `/admin/staff` | Registro y gestión de staff |
| `/admin/roles` | Roles y asignaciones |
| `/admin/catalogs` | Catálogos |
| `/admin/catalogs/:catalogKey` | Detalle de catálogo |
| `/admin/clients` | Clientes |
| `/admin/clients/:personId` | Detalle de cliente |
| `/admin/vehicles` | Vehículos |
| `/admin/vehicles/:vehicleId` | Detalle de vehículo |
| `/admin/service-orders` | Órdenes de servicio |
| `/admin/service-orders/:serviceOrderId` | Detalle de orden |
| `/admin/mechanics` | Mecánicos y carga de trabajo |
| `/admin/inventory` | Inventario |
| `/admin/purchases` | Compras |
| `/admin/invoices` | Facturación |
| `/admin/invoices/:invoiceId` | Detalle de factura |
| `/admin/payments` | Pagos |
| `/admin/reports` | Reportes |
| `/admin/audit` | Auditoría |
| `/admin/settings` | Diferida / ComingSoon |

### Mechanic

| Ruta | Propósito |
| --- | --- |
| `/mechanic/dashboard` | Dashboard del mecánico |
| `/mechanic/assigned-services` | Servicios asignados |
| `/mechanic/active-orders` | Órdenes activas |
| `/mechanic/service-detail` | Guía para abrir detalle de servicio |
| `/mechanic/service-detail/:orderServiceId` | Detalle de servicio |
| `/mechanic/record-work` | Guía para registrar trabajo |
| `/mechanic/record-work/:orderServiceId` | Registro de trabajo |
| `/mechanic/parts/request` | Solicitud de repuestos |
| `/mechanic/parts/request/:orderServiceId` | Solicitud de repuestos con servicio seleccionado |
| `/mechanic/parts/search` | Búsqueda de repuestos |
| `/mechanic/history` | Diferida / ComingSoon |

### Receptionist

| Ruta | Propósito |
| --- | --- |
| `/receptionist/dashboard` | Dashboard de recepción |
| `/receptionist/clients` | Consulta de clientes |
| `/receptionist/clients/new` | Crear cliente con vehículo inicial |
| `/receptionist/vehicles` | Consulta y vínculo de vehículos |
| `/receptionist/service-orders` | Órdenes activas |
| `/receptionist/service-orders/new` | Crear orden de servicio |
| `/receptionist/service-orders/assign-mechanic` | Diferida / ComingSoon |
| `/receptionist/inventory` | Inventario |
| `/receptionist/purchases` | Compras de inventario |
| `/receptionist/invoices` | Facturación |
| `/receptionist/payments/record` | Registro de pagos |
| `/receptionist/search` | Diferida / ComingSoon |

### Client

| Ruta | Propósito |
| --- | --- |
| `/client/dashboard` | Dashboard del cliente |
| `/client/approvals` | Aprobaciones pendientes |
| `/client/vehicles` | Vehículos propios |
| `/client/service-orders` | Órdenes propias |
| `/client/invoices` | Facturas propias |
| `/account/profile` | Perfil del usuario |

## Instalación

Clona el frontend:

```bash
git clone https://github.com/ximenaa19/AutoTallerManager-Fronted
cd AutoTallerManager-Fronted
pnpm.cmd install
```

En Windows se recomienda usar `pnpm.cmd` para evitar problemas con políticas de ejecución de PowerShell. En otros entornos puede usarse:

```bash
pnpm install
```

No uses `npm install`, porque este proyecto trabaja con `pnpm-lock.yaml`.

## Configuración

El frontend usa la variable:

```txt
VITE_API_BASE_URL=http://localhost:5077
```

Existe un archivo `.env.example` con ese valor. Para configurar tu entorno local:

```bash
copy .env.example .env
```

En macOS/Linux:

```bash
cp .env.example .env
```

Si no defines `VITE_API_BASE_URL`, `src/lib/env.ts` usa como valor por defecto:

```txt
http://localhost:5077
```

Backend repository: https://github.com/MLahitton/AutoTallerManager-Backend

## Ejecutar en desarrollo

Con dependencias instaladas y backend corriendo:

```bash
pnpm.cmd dev
```

También puedes usar:

```bash
pnpm.cmd run dev
```

Vite está configurado para servir el frontend en:

```txt
http://localhost:5173
```

## Build y lint

Para compilar:

```bash
pnpm.cmd build
```

Para ejecutar lint:

```bash
pnpm.cmd lint
```

El build ejecuta `tsc -b && vite build`. Vite puede mostrar un warning de chunks grandes; no necesariamente bloquea si el comando termina exitosamente.

# Guía de flujos por rol

## Flujo Admin

1. Iniciar sesión con un usuario con rol `Admin`.
2. Entrar a `/admin/dashboard`.
3. Revisar usuarios en `/admin/users`.
4. Registrar o revisar staff en `/admin/staff`.
5. Revisar roles y asignaciones en `/admin/roles`.
6. Revisar catálogos en `/admin/catalogs`.
7. Consultar clientes en `/admin/clients`.
8. Consultar vehículos en `/admin/vehicles`.
9. Consultar órdenes de servicio en `/admin/service-orders`.
10. Abrir una orden para revisar estado, servicios, asignaciones y acciones disponibles.
11. Revisar mecánicos y workload en `/admin/mechanics`.
12. Revisar inventario en `/admin/inventory`.
13. Registrar o consultar compras en `/admin/purchases`.
14. Revisar facturación en `/admin/invoices`.
15. Abrir detalle de factura en `/admin/invoices/:invoiceId`.
16. Revisar pagos en `/admin/payments`.
17. Procesar reembolsos solo si la UI y el backend lo permiten.
18. Revisar reportes en `/admin/reports`.
19. Revisar auditoría en `/admin/audit`.

Funciones importantes visibles en el frontend Admin:

- Gestión de usuarios, staff y roles.
- Gestión de catálogos.
- Gestión de clientes y vehículos.
- Consulta y operación de órdenes de servicio.
- Asignación y desasignación de mecánicos desde órdenes de servicio.
- Consulta de workload de mecánicos.
- Inventario, compras y cancelación de compras si el backend autoriza.
- Facturación, emisión/cancelación de facturas si el backend autoriza.
- Pagos y reembolsos si el backend autoriza.
- Reportes y auditoría.

## Flujo Mechanic

1. Iniciar sesión con un usuario con rol `Mechanic`.
2. Entrar a `/mechanic/dashboard`.
3. Ver servicios asignados en `/mechanic/assigned-services`.
4. Ver órdenes activas en `/mechanic/active-orders`.
5. Abrir detalle de servicio desde `/mechanic/service-detail/:orderServiceId`.
6. Revisar contexto del vehículo, cliente, placa, estado y datos de la orden cuando la UI los muestre.
7. Registrar trabajo realizado desde `/mechanic/record-work/:orderServiceId`.
8. Solicitar repuestos desde `/mechanic/parts/request` o `/mechanic/parts/request/:orderServiceId`.
9. Buscar repuestos desde `/mechanic/parts/search`.

El rol `Mechanic` no gestiona clientes, no factura y no registra pagos manuales.

## Flujo Receptionist

1. Iniciar sesión con un usuario con rol `Receptionist`.
2. Entrar a `/receptionist/dashboard`.
3. Crear cliente con vehículo inicial desde `/receptionist/clients/new`.
4. Consultar clientes desde `/receptionist/clients`.
5. Consultar o vincular vehículos desde `/receptionist/vehicles`.
6. Crear orden de servicio desde `/receptionist/service-orders/new`.
7. Seleccionar cliente.
8. Seleccionar vehículo.
9. Agregar servicios requeridos.
10. Revisar resumen e inventario de ingreso.
11. Crear la orden.
12. Consultar órdenes activas desde `/receptionist/service-orders`.
13. Revisar inventario desde `/receptionist/inventory`.
14. Registrar compras de inventario desde `/receptionist/purchases`.
15. Generar factura desde `/receptionist/invoices` cuando la orden tenga ítems aprobados.
16. Consultar líneas reales de factura en el modal de detalle.
17. Emitir o recalcular factura cuando la acción esté disponible.
18. Registrar pago desde `/receptionist/payments/record`.
19. Revisar resumen e historial de pagos.

Notas importantes para Receptionist:

- No asigna mecánicos porque `/receptionist/service-orders/assign-mechanic` sigue diferida.
- No usa cancelación de facturas en el módulo Receptionist.
- No cancela compras desde Receptionist si esa acción se mantiene como Admin-only.
- No realiza reembolsos desde Receptionist.
- Si una orden no tiene servicios o repuestos aprobados, el cliente debe revisar `/client/approvals` antes de generar factura.

## Flujo Client

1. Iniciar sesión con un usuario con rol `Client`.
2. Entrar a `/client/dashboard`.
3. Ver aprobaciones pendientes en `/client/approvals`.
4. Aprobar o rechazar servicios/repuestos pendientes.
5. Ver vehículos propios en `/client/vehicles`.
6. Ver órdenes de servicio propias en `/client/service-orders`.
7. Abrir detalle de orden.
8. Ver inventario de ingreso, servicios y repuestos asociados.
9. Ver facturas propias en `/client/invoices`.
10. Abrir detalle de factura.
11. Ver líneas de factura cuando el backend autorice ese detalle para Client.
12. Ver resumen de pagos e historial.

El rol `Client`:

- No crea órdenes.
- No crea vehículos.
- No registra pagos manuales.
- No cancela facturas.
- No edita información operativa.
- Solo aprueba o rechaza pendientes desde `/client/approvals`.

## Flujo integral de negocio

Prueba recomendada para validar el sistema completo:

1. Receptionist crea cliente y vehículo.
2. Receptionist crea una orden de servicio.
3. Mechanic revisa servicios asignados, registra trabajo o solicita repuestos.
4. Client aprueba o rechaza servicios/repuestos pendientes.
5. Receptionist genera la factura cuando existen ítems aprobados.
6. Receptionist emite la factura si corresponde.
7. Receptionist registra el pago.
8. Client consulta factura, líneas disponibles y estado de pago.
9. Admin consulta trazabilidad, gestión general, reportes y auditoría.

## Permisos y navegación

El frontend usa rutas protegidas por rol:

- `ProtectedRoute`: bloquea rutas privadas si no hay sesión activa.
- `RoleGuard`: valida que el usuario tenga acceso al rol requerido.
- `PrivateLayout`: renderiza la estructura privada de navegación y contenido.
- `RouteSuspense`: muestra estado de carga mientras las páginas lazy se cargan.

Cada rol tiene navegación propia definida en `src/routes/navigation.ts`. Las rutas de rol se agrupan en `src/routes/router.tsx` con `RoleGuard allowedRoles`.

## Relación con el backend

Backend repository: https://github.com/MLahitton/AutoTallerManager-Backend

El backend debe estar corriendo para que el frontend funcione correctamente. La autenticación, catálogos, búsquedas, órdenes, inventario, facturación, pagos, aprobaciones, reportes y auditoría dependen de la API.

La URL base de la API se configura con:

```txt
VITE_API_BASE_URL
```

Por defecto, el frontend apunta a:

```txt
http://localhost:5077
```

Los catálogos y datos iniciales deben existir en backend. Si una pantalla carga vacía, revisa que los seeders/migraciones del backend hayan corrido y que el usuario tenga el rol correcto.

## Validación rápida del frontend

Checklist sugerido:

```bash
pnpm.cmd install
pnpm.cmd build
pnpm.cmd lint
pnpm.cmd dev
```

Luego probar:

- `/admin/dashboard`
- `/mechanic/dashboard`
- `/receptionist/dashboard`
- `/client/dashboard`

También valida el flujo integral con dos sesiones de navegador si necesitas probar interacción entre Receptionist y Client.

## Troubleshooting

### `pnpm` bloqueado por PowerShell

En Windows, si PowerShell bloquea scripts, usa:

```bash
pnpm.cmd install
pnpm.cmd dev
```

También puedes ejecutar los comandos desde `cmd`.

### Backend apagado

Si las pantallas muestran errores de red o no cargan datos, confirma que el backend esté corriendo y que `VITE_API_BASE_URL` apunte al puerto correcto.

### URL del backend incorrecta

Revisa `.env`:

```txt
VITE_API_BASE_URL=http://localhost:5077
```

Si el backend usa otro puerto, actualiza ese valor y reinicia Vite.

### Error `401`

Puede indicar sesión expirada o token inválido. Cierra sesión e inicia de nuevo.

### Error `403`

Puede indicar que el usuario no tiene el rol necesario para esa ruta o endpoint.

### Catálogos vacíos

Revisa que el backend tenga datos iniciales cargados. Muchas pantallas dependen de catálogos de documentos, vehículos, servicios, repuestos, métodos de pago y estados.

### Warning de chunks grandes en Vite

Puede aparecer durante `pnpm.cmd build`. Si el build termina exitosamente, el warning no necesariamente bloquea la ejecución.

### Problemas de CORS

Si el navegador bloquea peticiones, revisa la configuración CORS del backend para permitir el origen de Vite:

```txt
http://localhost:5173
```

## Estado del proyecto

El frontend cuenta con módulos principales para:

- Admin.
- Mechanic.
- Receptionist.
- Client.

Pantallas diferidas visibles en rutas:

- `/admin/settings`
- `/mechanic/history`
- `/receptionist/service-orders/assign-mechanic`
- `/receptionist/search`

Nota: algunas acciones pueden depender de permisos, datos iniciales o endpoints habilitados en el backend.

## Buenas prácticas

- Usar `pnpm.cmd` en Windows.
- No usar `npm install`.
- No subir `package-lock.json`.
- Ejecutar `pnpm.cmd build` y `pnpm.cmd lint` antes de abrir PR.
- Mantener separación por roles.
- No mezclar lógica Admin con Client, Mechanic o Receptionist.
- No consumir endpoints de otros roles desde pantallas que no correspondan.
- Revisar permisos antes de exponer acciones nuevas.
- No incluir secretos, tokens ni contraseñas reales en documentación o código.
