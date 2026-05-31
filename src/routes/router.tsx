import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ForbiddenPage } from '@/components/feedback/ForbiddenPage';
import { PrivateLayout } from '@/components/layout/PrivateLayout';
import { SelectRolePage } from '@/features/auth/pages/SelectRolePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterClientPage } from '@/features/auth/pages/RegisterClientPage';
import { AccountProfilePlaceholderPage } from '@/pages/account/AccountProfilePlaceholderPage';
import { ChangePasswordPlaceholderPage } from '@/pages/account/ChangePasswordPlaceholderPage';
import { AdminPlaceholderPage } from '@/pages/placeholders/AdminPlaceholderPage';
import { ClientPlaceholderPage } from '@/pages/placeholders/ClientPlaceholderPage';
import { MechanicPlaceholderPage } from '@/pages/placeholders/MechanicPlaceholderPage';
import { ReceptionistPlaceholderPage } from '@/pages/placeholders/ReceptionistPlaceholderPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';
import { RoleGuard } from '@/routes/RoleGuard';
import { ROUTES } from '@/routes/routePaths';

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
              { path: ROUTES.ADMIN_DASHBOARD, element: <AdminPlaceholderPage /> },
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
                element: <ReceptionistPlaceholderPage />,
              },
            ],
          },
          {
            element: <RoleGuard allowedRoles={['Mechanic']} />,
            children: [
              {
                path: ROUTES.MECHANIC,
                element: <Navigate to={ROUTES.MECHANIC_DASHBOARD} replace />,
              },
              { path: ROUTES.MECHANIC_DASHBOARD, element: <MechanicPlaceholderPage /> },
            ],
          },
          {
            element: <RoleGuard allowedRoles={['Client']} />,
            children: [
              {
                path: ROUTES.CLIENT,
                element: <Navigate to={ROUTES.CLIENT_DASHBOARD} replace />,
              },
              { path: ROUTES.CLIENT_DASHBOARD, element: <ClientPlaceholderPage /> },
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
