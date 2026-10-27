import { Link } from 'react-router';
import styles from './Logo.module.css';

/** Coral compass-sparkle mark shared by the Dear Lavion apps. */
export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className={styles.logo}>
      <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" fill="#E38B4E" />
        <circle cx="20" cy="20" r="18" fill="none" stroke="#F2AE3E" strokeWidth="1.5" />
        <path d="M20 8 L23 17 L32 20 L23 23 L20 32 L17 23 L8 20 L17 17 Z" fill="#fff" />
      </svg>
      Dear Lavion Security
    </Link>
  );
}
