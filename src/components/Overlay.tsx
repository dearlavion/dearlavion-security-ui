import { useEffect, type ReactNode } from 'react';
import styles from './Overlay.module.css';

interface Props {
  eyebrow?: string;
  title?: string;
  onClose: () => void;
  wide?: boolean;
  /** Wider still, for editors with tables (e.g. a test idea's test materials). */
  extraWide?: boolean;
  align?: 'center' | 'left';
  children: ReactNode;
}

/** The travel-besty auth overlay: blurred ink backdrop + floating white card. Used for auth and modals. */
export function Overlay({ eyebrow, title, onClose, wide, extraWide, align = 'center', children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.card} ${wide ? styles.wide : ''} ${extraWide ? styles.extraWide : ''} ${align === 'left' ? styles.left : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {title && <h1 className={styles.title}>{title}</h1>}
        {children}
      </div>
    </div>
  );
}
