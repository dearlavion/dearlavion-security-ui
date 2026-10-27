import type { Permission } from '../lib/types';
import { PERMISSIONS } from './Badges';
import styles from './PermissionPicker.module.css';

/** READ, MODIFY or both, as three option cards. */
export function PermissionPicker({ value, onChange }: { value: Permission; onChange: (p: Permission) => void }) {
  return (
    <div className={styles.options} role="radiogroup" aria-label="Permission">
      {PERMISSIONS.map((p) => (
        <label key={p.id} className={`${styles.option} ${value === p.id ? styles.selected : ''}`}>
          <input type="radio" name="permission" value={p.id} checked={value === p.id} onChange={() => onChange(p.id)} />
          <span>
            <strong>{p.label}</strong>
            <span className="muted">{p.hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
