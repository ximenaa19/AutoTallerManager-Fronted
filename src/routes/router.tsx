import { type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ForbiddenPage } from '@/components/feedback/ForbiddenPage';
import { PrivateLayout } from '@/components/layout/PrivateLayout';
import {
  AccountProfilePage,
  AdminDashboardPage,
  AuditPage,
  CatalogDetailPage,
  CatalogsHomePage,
  ChangePasswordPage,
  ClientDashboardPage,
  ComingSoonPage,
  CustomerDetailPage,
  CustomersPage,
  InventoryPage,
  InvoiceDetailPage,
  InvoicingPage,
  LoginPage,
  MechanicActiveOrdersPage,
  MechanicAssignedServicesPage,
  MechanicContextualGuidancePage,
  MechanicDashboardPage,
  MechanicRecordWorkPage,
  MechanicServiceDetailPage,
  MechanicsPage,
  PaymentsPage,
  PurchasesPage,
  ReceptionistDashboardPage,
  RegisterClientPage,
  ReportsPage,
  RolesPage,
  SelectRolePage,
  ServiceOrderDetailPage,
  ServiceOrdersPage,
  StaffPage,
  UsersPage,
  VehicleDetailPage,
  VehiclesPage,
} from '@/routes/lazyPages';
import { RouteSuspense } from '@/routes/RouteSuspense';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';
import { RoleGuard } from '@/routes/RoleGuard';
import { ROUTES } from '@/routes/routePaths';

function lazyRoute(LazyComponent: LazyExoticComponent<ComponentType>) {
  return (
    <RouteSuspense>
      <LazyComponent />
    </RouteSuspense>
  );
}

const comingSoon = lazyRoute(ComingSoonPage);

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: ROUTES.LOGIN, element: lazyRoute(LoginPage) },
      { path: ROUTES.REGISTER_CLIENT, element: lazyRoute(RegisterClientPage) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.SELECT_ROLE,
        element: lazyRoute(SelectRolePage),
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
              { path: ROUTES.ADMIN_DASHBOARD, element: lazyRoute(AdminDashboardPage) },
              { path: ROUTES.ADMIN_USERS, element: lazyRoute(UsersPage) },
              { path: ROUTES.ADMIN_STAFF, element: lazyRoute(StaffPage) },
              { path: ROUTES.ADMIN_ROLES, element: lazyRoute(RolesPage) },
              { path: ROUTES.ADMIN_CATALOGS, element: lazyRoute(CatalogsHomePage) },
              { path: ROUTES.ADMIN_CATALOG_DETAIL, element: lazyRoute(CatalogDetailPage) },
              { path: ROUTES.ADMIN_CLIENTS, element: lazyRoute(CustomersPage) },
              { path: ROUTES.ADMIN_CLIENT_DETAIL, element: lazyRoute(CustomerDetailPage) },
              { path: ROUTES.ADMIN_VEHICLES, element: lazyRoute(VehiclesPage) },
              { path: ROUTES.ADMIN_VEHICLE_DETAIL, element: lazyRoute(VehicleDetailPage) },
              { path: ROUTES.ADMIN_SERVICE_ORDERS, element: lazyRoute(ServiceOrdersPage) },
              {
                path: ROUTES.ADMIN_SERVICE_ORDER_DETAIL,
                element: lazyRoute(ServiceOrderDetailPage),
              },
              { path: ROUTES.ADMIN_MECHANICS, element: lazyRoute(MechanicsPage) },
              { path: ROUTES.ADMIN_INVENTORY, element: lazyRoute(InventoryPage) },
              { path: ROUTES.ADMIN_PURCHASES, element: lazyRoute(PurchasesPage) },
              { path: ROUTES.ADMIN_INVOICES, element: lazyRoute(InvoicingPage) },
              { path: ROUTES.ADMIN_INVOICE_DETAIL, element: lazyRoute(InvoiceDetailPage) },
              { path: ROUTES.ADMIN_PAYMENTS, element: lazyRoute(PaymentsPage) },
              { path: ROUTES.ADMIN_REPORTS, element: lazyRoute(ReportsPage) },
              { path: ROUTES.ADMIN_AUDIT, element: lazyRoute(AuditPage) },
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
                element: lazyRoute(ReceptionistDashboardPage),
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
              { path: ROUTES.MECHANIC_DASHBOARD, element: lazyRoute(MechanicDashboardPage) },
              {
                path: ROUTES.MECHANIC_ASSIGNED_SERVICES,
                element: lazyRoute(MechanicAssignedServicesPage),
              },
              {
                path: ROUTES.MECHANIC_ACTIVE_ORDERS,
                element: lazyRoute(MechanicActiveOrdersPage),
              },
              {
                path: ROUTES.MECHANIC_SERVICE_DETAIL_HOME,
                element: lazyRoute(MechanicContextualGuidancePage),
              },
              {
                path: ROUTES.MECHANIC_SERVICE_DETAIL,
                element: lazyRoute(MechanicServiceDetailPage),
              },
              {
                path: ROUTES.MECHANIC_RECORD_WORK_HOME,
                element: lazyRoute(MechanicContextualGuidancePage),
              },
              {
                path: ROUTES.MECHANIC_RECORD_WORK,
                element: lazyRoute(MechanicRecordWorkPage),
              },
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
              { path: ROUTES.CLIENT_DASHBOARD, element: lazyRoute(ClientDashboardPage) },
              { path: ROUTES.CLIENT_VEHICLES, element: comingSoon },
              { path: ROUTES.CLIENT_SERVICE_ORDERS, element: comingSoon },
              { path: ROUTES.CLIENT_APPROVALS, element: comingSoon },
              { path: ROUTES.CLIENT_INVOICES, element: comingSoon },
            ],
          },
          {
            path: ROUTES.ACCOUNT_PROFILE,
            element: lazyRoute(AccountProfilePage),
          },
          {
            path: ROUTES.ACCOUNT_CHANGE_PASSWORD,
            element: lazyRoute(ChangePasswordPage),
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
