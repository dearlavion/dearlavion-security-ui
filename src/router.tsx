import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router';
import { AppShell } from './components/AppShell';
import { Toast } from './components/Toast';
import { refreshSession } from './lib/authApi';
import { useSession } from './lib/session';
import { Approvals } from './pages/Approvals';
import { Audit } from './pages/Audit';
import { Denied } from './pages/Denied';
import { Login } from './pages/Login';
import { ProjectDetail } from './pages/ProjectDetail';
import { Projects } from './pages/Projects';

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
          { path: '/approvals', element: <Approvals /> },
          { path: '/audit', element: <Audit /> },
        ],
      },
      { path: '*', element: <Navigate to="/projects" replace /> },
    ],
  },
]);
