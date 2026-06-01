import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ForbiddenPage } from '@/components/feedback/ForbiddenPage';
import { PrivateLayout } from '@/components/layout/PrivateLayout';
import { SelectRolePage } from '@/features/auth/pages/SelectRolePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterClientPage } from '@/features/auth/pages/RegisterClientPage';
import { AccountProfilePlaceholderPage } from '@/pages/account/AccountProfilePlaceholderPage';
import { ChangePasswordPlaceholderPage } from '@/pages/account/ChangePasswordPlaceholderPage';
import { AdminDashboardPage } from '@/pages/dashboards/AdminDashboardPage';
import { ClientDashboardPage } from '@/pages/dashboards/ClientDashboardPage';
import { MechanicDashboardPage } from '@/pages/dashboards/MechanicDashboardPage';
import { ReceptionistDashboardPage } from '@/pages/dashboards/ReceptionistDashboardPage';
import { ComingSoonPage } from '@/pages/placeholders/ComingSoonPage';
import { UsersPage } from '@/features/admin/pages/UsersPage';
import { StaffPage } from '@/features/admin/pages/StaffPage';
import { RolesPage } from '@/features/admin/pages/RolesPage';
import { CatalogsHomePage } from '@/features/admin/catalogs/pages/CatalogsHomePage';
import { CatalogDetailPage } from '@/features/admin/catalogs/pages/CatalogDetailPage';
import { CustomersPage } from '@/features/admin/customers/pages/CustomersPage';
import { CustomerDetailPage } from '@/features/admin/customers/pages/CustomerDetailPage';
import { VehiclesPage } from '@/features/admin/vehicles/pages/VehiclesPage';
import { VehicleDetailPage } from '@/features/admin/vehicles/pages/VehicleDetailPage';
import { ServiceOrdersPage } from '@/features/admin/serviceOrders/pages/ServiceOrdersPage';
import { ServiceOrderDetailPage } from '@/features/admin/serviceOrders/pages/ServiceOrderDetailPage';
import { InventoryPage } from '@/features/admin/inventory/pages/InventoryPage';
import { PurchasesPage } from '@/features/admin/inventory/pages/PurchasesPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';
import { RoleGuard } from '@/routes/RoleGuard';
import { ROUTES } from '@/routes/routePaths';

const comingSoon = <ComingSoonPage />;

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER_CLIENT, element: <RegisterClientPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.SELECT_ROLE,
        element: <SelectRolePage />,
      },
      {
        path: ROUTES.FORBIDDEN,
        element: <ForbiddenPage />,
      },
      {
        element: <PrivateLayout />,
        children: [
          {
            element: <RoleGuard allowedRoles={['Admin']} />,
            children: [
              { path: ROUTES.ADMIN, element: <Navigate to={ROUTES.ADMIN_DASHBOARD} replace /> },
              { path: ROUTES.ADMIN_DASHBOARD, element: <AdminDashboardPage /> },
              { path: ROUTES.ADMIN_USERS, element: <UsersPage /> },
              { path: ROUTES.ADMIN_STAFF, element: <StaffPage /> },
              { path: ROUTES.ADMIN_ROLES, element: <RolesPage /> },
              { path: ROUTES.ADMIN_CATALOGS, element: <CatalogsHomePage /> },
              { path: ROUTES.ADMIN_CATALOG_DETAIL, element: <CatalogDetailPage /> },
              { path: ROUTES.ADMIN_CLIENTS, element: <CustomersPage /> },
              { path: ROUTES.ADMIN_CLIENT_DETAIL, element: <CustomerDetailPage /> },
              { path: ROUTES.ADMIN_VEHICLES, element: <VehiclesPage /> },
              { path: ROUTES.ADMIN_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
              { path: ROUTES.ADMIN_SERVICE_ORDERS, element: <ServiceOrdersPage /> },
              { path: ROUTES.ADMIN_SERVICE_ORDER_DETAIL, element: <ServiceOrderDetailPage /> },
              { path: ROUTES.ADMIN_MECHANICS, element: comingSoon },
              { path: ROUTES.ADMIN_INVENTORY, element: <InventoryPage /> },
              { path: ROUTES.ADMIN_PURCHASES, element: <PurchasesPage /> },
              { path: ROUTES.ADMIN_INVOICES, element: comingSoon },
              { path: ROUTES.ADMIN_PAYMENTS, element: comingSoon },
              { path: ROUTES.ADMIN_REPORTS, element: comingSoon },
              { path: ROUTES.ADMIN_AUDIT, element: comingSoon },
              { path: ROUTES.ADMIN_SETTINGS, element: comingSoon },
            ],
          },
          {
            element: <RoleGuard allowedRoles={['Receptionist']} />,
            children: [
              {
                path: ROUTES.RECEPTIONIST,
                element: <Navigate to={ROUTES.RECEPTIONIST_DASHBOARD} replace />,
              },
              {
                path: ROUTES.RECEPTIONIST_DASHBOARD,
                element: <ReceptionistDashboardPage />,
              },
              { path: ROUTES.RECEPTIONIST_CLIENTS, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_CLIENTS_NEW, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_VEHICLES, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_SERVICE_ORDERS_NEW, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_SERVICE_ORDERS, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_ASSIGN_MECHANIC, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_INVENTORY, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_PURCHASES, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_INVOICES, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_PAYMENTS, element: comingSoon },
              { path: ROUTES.RECEPTIONIST_SEARCH, element: comingSoon },
            ],
          },
          {
            element: <RoleGuard allowedRoles={['Mechanic']} />,
            children: [
              {
                path: ROUTES.MECHANIC,
                element: <Navigate to={ROUTES.MECHANIC_DASHBOARD} replace />,
              },
              { path: ROUTES.MECHANIC_DASHBOARD, element: <MechanicDashboardPage /> },
              { path: ROUTES.MECHANIC_ASSIGNED_SERVICES, element: comingSoon },
              { path: ROUTES.MECHANIC_ACTIVE_ORDERS, element: comingSoon },
              { path: ROUTES.MECHANIC_SERVICE_DETAIL, element: comingSoon },
              { path: ROUTES.MECHANIC_RECORD_WORK, element: comingSoon },
              { path: ROUTES.MECHANIC_REQUEST_PARTS, element: comingSoon },
              { path: ROUTES.MECHANIC_SEARCH_PARTS, element: comingSoon },
              { path: ROUTES.MECHANIC_HISTORY, element: comingSoon },
            ],
          },
          {
            element: <RoleGuard allowedRoles={['Client']} />,
            children: [
              {
                path: ROUTES.CLIENT,
                element: <Navigate to={ROUTES.CLIENT_DASHBOARD} replace />,
              },
              { path: ROUTES.CLIENT_DASHBOARD, element: <ClientDashboardPage /> },
              { path: ROUTES.CLIENT_VEHICLES, element: comingSoon },
              { path: ROUTES.CLIENT_SERVICE_ORDERS, element: comingSoon },
              { path: ROUTES.CLIENT_APPROVALS, element: comingSoon },
              { path: ROUTES.CLIENT_INVOICES, element: comingSoon },
            ],
          },
          {
            path: ROUTES.ACCOUNT_PROFILE,
            element: <AccountProfilePlaceholderPage />,
          },
          {
            path: ROUTES.ACCOUNT_CHANGE_PASSWORD,
            element: <ChangePasswordPlaceholderPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);
