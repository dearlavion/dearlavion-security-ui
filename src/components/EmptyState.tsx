import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export function EmptyState({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>{icon}</span>
      <h3>{title}</h3>
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
