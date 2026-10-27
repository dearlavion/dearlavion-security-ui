import { useState } from 'react';
import { useDecide } from '../lib/queries';
import type { ManagedUser, Permission } from '../lib/types';
import { fullName, PERMISSIONS } from './Badges';
import { Overlay } from './Overlay';
import styles from './PermissionOverlay.module.css';

interface Props {
  customer: string;
  user: ManagedUser;
  onClose: () => void;
}

/** Approve an admin, or change an approved admin's permission: READ, MODIFY or both. */
export function PermissionOverlay({ customer, user, onClose }: Props) {
  const approving = user.status !== 'APPROVED';
  const [permission, setPermission] = useState<Permission>(approving ? 'READ' : user.permission);
  const decide = useDecide(approving ? 'Admin approved' : 'Permission updated');

  const save = () =>
    decide.mutate({ customer, username: user.username, status: 'APPROVED', permission }, { onSuccess: onClose });

  return (
    <Overlay eyebrow={customer} title={approving ? 'Approve admin' : 'Change permission'} onClose={onClose}>
      <p className="muted" style={{ marginBottom: 16 }}>
        {fullName(user)} · {user.email}
      </p>
      <div className={styles.options} role="radiogroup" aria-label="Permission">
        {PERMISSIONS.map((p) => (
          <label key={p.id} className={`${styles.option} ${permission === p.id ? styles.selected : ''}`}>
            <input type="radio" name="permission" value={p.id} checked={permission === p.id} onChange={() => setPermission(p.id)} />
            <span>
              <strong>{p.label}</strong>
              <span className="muted">{p.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={save} disabled={decide.isPending}>
        {decide.isPending ? 'Saving…' : approving ? 'Approve' : 'Save'}
      </button>
    </Overlay>
  );
}
