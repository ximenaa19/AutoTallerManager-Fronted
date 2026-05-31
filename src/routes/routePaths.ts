export const ROUTES = {
  LOGIN: '/login',
  REGISTER_CLIENT: '/register-client',
  SELECT_ROLE: '/select-role',
  FORBIDDEN: '/forbidden',

  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',

  RECEPTIONIST: '/receptionist',
  RECEPTIONIST_DASHBOARD: '/receptionist/dashboard',

  MECHANIC: '/mechanic',
  MECHANIC_DASHBOARD: '/mechanic/dashboard',

  CLIENT: '/client',
  CLIENT_DASHBOARD: '/client/dashboard',

  ACCOUNT_PROFILE: '/account/profile',
  ACCOUNT_CHANGE_PASSWORD: '/account/change-password',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
