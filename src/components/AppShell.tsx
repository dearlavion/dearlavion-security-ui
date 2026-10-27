import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { logout } from '../lib/authApi';
import { useApprovals } from '../lib/queries';
import { AccountMenu } from './AccountMenu';
import { Logo } from './Logo';
import styles from './AppShell.module.css';

/** Same shell as the other Dear Lavion apps: light top bar, sticky sidebar, soft colour blobs. */
export function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: pending } = useApprovals();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const link = ({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`;
  const sublink = ({ isActive }: { isActive: boolean }) => `${styles.link} ${styles.subLink} ${isActive ? styles.active : ''}`;
  const inGroup = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const inUsers = inGroup('/users');
  const inRoles = inGroup('/roles');

  return (
    <div className={styles.shell}>
      <div className={styles.blobA} aria-hidden="true" />
      <div className={styles.blobB} aria-hidden="true" />
      <header className={styles.bar}>
        <div className={styles.barWrap}>
          <Logo to="/projects" />
          <div className="spacer" />
          <div className={styles.accountWrap}><AccountMenu /></div>
          <button type="button" className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">
            <span className={`${styles.menuIcon} ${menuOpen ? styles.open : ''}`}><span /><span /><span /></span>
          </button>
        </div>
      </header>
      <div className={styles.page}>
        <aside className={styles.sidebar}>
          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
            <NavLink to="/projects" className={link}><span className={styles.icon}>🧭</span>Projects</NavLink>
            <NavLink to="/admin-requests" className={link}>
              <span className={styles.icon}>🔔</span>Admin requests
              {!!pending?.length && <span className="badge badge-marigold" style={{ marginLeft: 'auto' }}>{pending.length}</span>}
            </NavLink>
            <NavGroup base="/users" label="Users" icon="👥" open={inUsers} link={link} sublink={sublink} />
            <NavGroup base="/roles" label="Role" icon="🏷️" open={inRoles} link={link} sublink={sublink} />
            <NavLink to="/permissions" className={link}><span className={styles.icon}>🔑</span>Permission management</NavLink>
            <NavLink to="/audit" className={link}><span className={styles.icon}>📜</span>Audit log</NavLink>
            <div className={styles.mobileOnly}>
              <div className={styles.divider} />
              <button type="button" className={`${styles.link} ${styles.logout}`} onClick={async () => { await logout(); navigate('/login'); }}>
                <span className={styles.icon}>↩</span>Logout
              </button>
            </div>
          </nav>
        </aside>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type LinkClass = ({ isActive }: { isActive: boolean }) => string;

/** A sidebar entry that opens a sub menu (Create, Search) while you are anywhere under its path. */
function NavGroup({ base, label, icon, open, sublink }: {
  base: string;
  label: string;
  icon: string;
  open: boolean;
  link: LinkClass;
  sublink: LinkClass;
}) {
  return (
    <>
      <NavLink to={base} className={({ isActive }) => `${styles.link} ${isActive ? styles.parentActive : ''}`}>
        <span className={styles.icon}>{icon}</span>{label}
        <span className={styles.chevron} aria-hidden="true">{open ? '▾' : '▸'}</span>
      </NavLink>
      {open && (
        <div className={styles.subNav}>
          <NavLink to={`${base}/new`} className={sublink}>Create</NavLink>
          <NavLink to={base} end className={sublink}>Search</NavLink>
        </div>
      )}
    </>
  );
}
