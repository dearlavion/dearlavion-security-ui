import { useState } from 'react';
import { useDecide, useSetActive } from '../lib/queries';
import type { ManagedUser } from '../lib/types';
import { fullName } from './Badges';
import { ConfirmOverlay } from './ConfirmOverlay';
import { PermissionOverlay } from './PermissionOverlay';

type Open = 'permission' | 'reject' | 'deactivate' | null;

/** Row actions: admins are approved/rejected and given a permission; anyone can be deactivated or restored. */
export function UserActions({ customer, user }: { customer: string; user: ManagedUser }) {
  const [open, setOpen] = useState<Open>(null);
  const decide = useDecide('Admin rejected');
  const setActive = useSetActive();
  const isAdmin = user.activeProfile === 'ADMIN' || user.activeProfile === 'STAFF';
  const close = () => setOpen(null);

  return (
    <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
      {isAdmin && user.status !== 'APPROVED' && (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen('permission')}>Approve</button>
      )}
      {isAdmin && user.status === 'APPROVED' && (
        <button type="button" className="btn btn-soft btn-sm" onClick={() => setOpen('permission')}>Permission</button>
      )}
      {isAdmin && user.status !== 'REJECTED' && (
        <button type="button" className="btn btn-danger btn-sm" onClick={() => setOpen('reject')}>Reject</button>
      )}
      {user.active ? (
        <button type="button" className="btn btn-danger btn-sm" onClick={() => setOpen('deactivate')}>Deactivate</button>
      ) : (
        <button type="button" className="btn btn-soft btn-sm" onClick={() => setActive.mutate({ customer, username: user.username, active: true })}>Restore</button>
      )}

      {open === 'permission' && <PermissionOverlay customer={customer} user={user} onClose={close} />}
      {open === 'reject' && (
        <ConfirmOverlay
          title="Reject admin?"
          message={`${fullName(user)} loses admin access to ${customer} straight away and can't sign in until approved again.`}
          confirmLabel="Reject"
          busy={decide.isPending}
          onClose={close}
          onConfirm={() => decide.mutate({ customer, username: user.username, status: 'REJECTED' }, { onSuccess: close })}
        />
      )}
      {open === 'deactivate' && (
        <ConfirmOverlay
          title="Deactivate account?"
          message={`${fullName(user)} won't be able to sign in to ${customer}. You can restore the account later.`}
          confirmLabel="Deactivate"
          busy={setActive.isPending}
          onClose={close}
          onConfirm={() => setActive.mutate({ customer, username: user.username, active: false }, { onSuccess: close })}
        />
      )}
    </div>
  );
}
