import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router';
import { AppShell } from './components/AppShell';
import { Toast } from './components/Toast';
import { refreshSession } from './lib/authApi';
import { useSession } from './lib/session';
import { AdminRequests } from './pages/AdminRequests';
import { Audit } from './pages/Audit';
import { Denied } from './pages/Denied';
import { CreateUser } from './pages/CreateUser';
import { CreateRole } from './pages/CreateRole';
import { Login } from './pages/Login';
import { ProjectDetail } from './pages/ProjectDetail';
import { PermissionManagement } from './pages/PermissionManagement';
import { Projects } from './pages/Projects';
import { Roles } from './pages/Roles';
import { Users } from './pages/Users';

/** Tries to restore the session from the refresh cookie once, before rendering anything. */
function Root() {
  const status = useSession((s) => s.status);
  useEffect(() => {
    if (status === 'unknown') void refreshSession();
  }, [status]);
  if (status === 'unknown') return <div className="center-page">✿</div>;
  return (
    <>
      <Outlet />
      <Toast />
    </>
  );
}

/** Only a signed-in SUPERADMIN gets the dashboard; the API enforces the same rule. */
function RequireSuperadmin() {
  const { status, user } = useSession();
  const location = useLocation();
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (user?.role !== 'SUPERADMIN') return <Denied />;
  return <AppShell />;
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/login', element: <Login /> },
      {
        element: <RequireSuperadmin />,
        children: [
          { path: '/projects', element: <Projects /> },
          { path: '/projects/:customer', element: <ProjectDetail /> },
          { path: '/admin-requests', element: <AdminRequests /> },
          { path: '/users', element: <Users /> },
          { path: '/users/new', element: <CreateUser /> },
          { path: '/roles', element: <Roles /> },
          { path: '/roles/new', element: <CreateRole /> },
          { path: '/permissions', element: <PermissionManagement /> },
          { path: '/audit', element: <Audit /> },
        ],
      },
      // The page used to be called Approvals.
      { path: '/approvals', element: <Navigate to="/admin-requests" replace /> },
      { path: '*', element: <Navigate to="/projects" replace /> },
    ],
  },
]);
