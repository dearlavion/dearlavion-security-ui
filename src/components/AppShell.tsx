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
            <NavLink to="/approvals" className={link}>
              <span className={styles.icon}>🔔</span>Approvals
              {!!pending?.length && <span className="badge badge-marigold" style={{ marginLeft: 'auto' }}>{pending.length}</span>}
            </NavLink>
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
