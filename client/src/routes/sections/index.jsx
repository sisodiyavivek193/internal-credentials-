import { dashboardRoutes } from '@/pages/admin/routes/dashboard';
import { userDashboardRoutes } from '@/pages/user/routes/dashboard';
import { authRoutes } from '@/pages/auth/routes/auth';


import NotFoundError from '@/pages/error/NotFoundError';


export const routesSection = [

  ...authRoutes,

  ...dashboardRoutes,

  ...userDashboardRoutes,

  { path: '*', element: <NotFoundError /> },
];
