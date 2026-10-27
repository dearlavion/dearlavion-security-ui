import { useState } from 'react';
import { useDecide } from '../lib/queries';
import type { ManagedUser, Permission } from '../lib/types';
import { fullName } from './Badges';
import { Overlay } from './Overlay';
import { PermissionPicker } from './PermissionPicker';
import { RolePresetSelect } from './RolePresetSelect';

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
      <RolePresetSelect customer={customer} onPick={setPermission} />
      <div style={{ marginBottom: 20 }}><PermissionPicker value={permission} onChange={setPermission} /></div>
      <button type="button" className="btn btn-primary btn-block" onClick={save} disabled={decide.isPending}>
        {decide.isPending ? 'Saving…' : approving ? 'Approve' : 'Save'}
      </button>
    </Overlay>
  );
}
