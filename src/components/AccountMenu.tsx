import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { logout } from '../lib/authApi';
import { useSession } from '../lib/session';
import styles from './AccountMenu.module.css';

/** The user popup (initial button + menu) in the top bar. */
export function AccountMenu() {
  const user = useSession((s) => s.user);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (user?.displayName ?? '?').charAt(0).toUpperCase();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const signOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.btn} onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu">
        {initial}
      </button>
      {open && (
        <div className={styles.menu}>
          <div className={styles.head}>
            <span className={styles.avatar}>{initial}</span>
            <strong>Hello, {user?.displayName}</strong>
            <span className="muted">@{user?.username}</span>
          </div>
          <button type="button" className={`${styles.item} ${styles.logout}`} onClick={signOut}>Logout</button>
        </div>
      )}
    </div>
  );
}
