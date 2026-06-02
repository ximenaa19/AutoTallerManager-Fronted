import { lazy } from 'react';

export const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
);

export const RegisterClientPage = lazy(() =>
  import('@/features/auth/pages/RegisterClientPage').then((module) => ({
    default: module.RegisterClientPage,
  })),
);

export const SelectRolePage = lazy(() =>
  import('@/features/auth/pages/SelectRolePage').then((module) => ({
    default: module.SelectRolePage,
  })),
);

export const AccountProfilePage = lazy(() =>
  import('@/features/account/pages/AccountProfilePage').then((module) => ({
    default: module.AccountProfilePage,
  })),
);

export const ChangePasswordPage = lazy(() =>
  import('@/features/account/pages/ChangePasswordPage').then((module) => ({
    default: module.ChangePasswordPage,
  })),
);

export const AdminDashboardPage = lazy(() =>
  import('@/pages/dashboards/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);

export const ReceptionistDashboardPage = lazy(() =>
  import('@/pages/dashboards/ReceptionistDashboardPage').then((module) => ({
    default: module.ReceptionistDashboardPage,
  })),
);

export const MechanicDashboardPage = lazy(() =>
  import('@/features/mechanic/pages/MechanicDashboardPage').then((module) => ({
    default: module.MechanicDashboardPage,
  })),
);

export const MechanicAssignedServicesPage = lazy(() =>
  import('@/features/mechanic/pages/MechanicAssignedServicesPage').then((module) => ({
    default: module.MechanicAssignedServicesPage,
  })),
);

export const MechanicActiveOrdersPage = lazy(() =>
  import('@/features/mechanic/pages/MechanicActiveOrdersPage').then((module) => ({
    default: module.MechanicActiveOrdersPage,
  })),
);

export const ClientDashboardPage = lazy(() =>
  import('@/pages/dashboards/ClientDashboardPage').then((module) => ({
    default: module.ClientDashboardPage,
  })),
);

export const ComingSoonPage = lazy(() =>
  import('@/pages/placeholders/ComingSoonPage').then((module) => ({
    default: module.ComingSoonPage,
  })),
);

export const UsersPage = lazy(() =>
  import('@/features/admin/pages/UsersPage').then((module) => ({
    default: module.UsersPage,
  })),
);

export const StaffPage = lazy(() =>
  import('@/features/admin/pages/StaffPage').then((module) => ({
    default: module.StaffPage,
  })),
);

export const RolesPage = lazy(() =>
  import('@/features/admin/pages/RolesPage').then((module) => ({
    default: module.RolesPage,
  })),
);

export const CatalogsHomePage = lazy(() =>
  import('@/features/admin/catalogs/pages/CatalogsHomePage').then((module) => ({
    default: module.CatalogsHomePage,
  })),
);

export const CatalogDetailPage = lazy(() =>
  import('@/features/admin/catalogs/pages/CatalogDetailPage').then((module) => ({
    default: module.CatalogDetailPage,
  })),
);

export const CustomersPage = lazy(() =>
  import('@/features/admin/customers/pages/CustomersPage').then((module) => ({
    default: module.CustomersPage,
  })),
);

export const CustomerDetailPage = lazy(() =>
  import('@/features/admin/customers/pages/CustomerDetailPage').then((module) => ({
    default: module.CustomerDetailPage,
  })),
);

export const VehiclesPage = lazy(() =>
  import('@/features/admin/vehicles/pages/VehiclesPage').then((module) => ({
    default: module.VehiclesPage,
  })),
);

export const VehicleDetailPage = lazy(() =>
  import('@/features/admin/vehicles/pages/VehicleDetailPage').then((module) => ({
    default: module.VehicleDetailPage,
  })),
);

export const ServiceOrdersPage = lazy(() =>
  import('@/features/admin/serviceOrders/pages/ServiceOrdersPage').then((module) => ({
    default: module.ServiceOrdersPage,
  })),
);

export const ServiceOrderDetailPage = lazy(() =>
  import('@/features/admin/serviceOrders/pages/ServiceOrderDetailPage').then((module) => ({
    default: module.ServiceOrderDetailPage,
  })),
);

export const MechanicsPage = lazy(() =>
  import('@/features/admin/mechanics/pages/MechanicsPage').then((module) => ({
    default: module.MechanicsPage,
  })),
);

export const InventoryPage = lazy(() =>
  import('@/features/admin/inventory/pages/InventoryPage').then((module) => ({
    default: module.InventoryPage,
  })),
);

export const PurchasesPage = lazy(() =>
  import('@/features/admin/inventory/pages/PurchasesPage').then((module) => ({
    default: module.PurchasesPage,
  })),
);

export const InvoicingPage = lazy(() =>
  import('@/features/admin/billing/pages/InvoicingPage').then((module) => ({
    default: module.InvoicingPage,
  })),
);

export const InvoiceDetailPage = lazy(() =>
  import('@/features/admin/billing/pages/InvoiceDetailPage').then((module) => ({
    default: module.InvoiceDetailPage,
  })),
);

export const PaymentsPage = lazy(() =>
  import('@/features/admin/billing/pages/PaymentsPage').then((module) => ({
    default: module.PaymentsPage,
  })),
);

export const ReportsPage = lazy(() =>
  import('@/features/admin/reports/pages/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  })),
);

export const AuditPage = lazy(() =>
  import('@/features/admin/reports/pages/AuditPage').then((module) => ({
    default: module.AuditPage,
  })),
);
