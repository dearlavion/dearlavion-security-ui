import { useEffect } from 'react';
import { useToast } from './toastStore';
import styles from './Toast.module.css';

const ICON = { success: '✓', error: '!', info: 'i' };

/** Centered floating toast with a blurred backdrop, same as travel-besty's. Auto-dismisses. */
export function Toast() {
  const { toast, clear } = useToast();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clear, toast.kind === 'error' ? 3200 : 2200);
    return () => clearTimeout(t);
  }, [toast, clear]);

  if (!toast) return null;
  return (
    <div className={styles.backdrop} onClick={clear} role="status" aria-live="polite">
      <div className={`${styles.toast} ${styles[toast.kind]}`} key={toast.id}>
        <span className={styles.icon}>{ICON[toast.kind]}</span>
        <p className={styles.message}>{toast.message}</p>
      </div>
    </div>
  );
}
