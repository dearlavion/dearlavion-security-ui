import type { ApprovalStatus, ManagedUser, Permission } from '../lib/types';

const STATUS: Record<ApprovalStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'badge-marigold' },
  APPROVED: { label: 'Approved', cls: 'badge-green' },
  REJECTED: { label: 'Rejected', cls: 'badge-pink' },
};

export const PERMISSIONS: { id: Permission; label: string; hint: string }[] = [
  { id: 'READ', label: 'Read', hint: 'Can view data in the project, but not change it.' },
  { id: 'MODIFY', label: 'Modify', hint: 'Can change data in the project, but not view it.' },
  { id: 'BOTH', label: 'Read & modify', hint: 'Full access to the project’s data.' },
];

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  const s = STATUS[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

/** Permission only means something for an approved admin. */
export function PermissionBadge({ user }: { user: ManagedUser }) {
  if (user.status !== 'APPROVED') return <span className="muted">—</span>;
  const p = PERMISSIONS.find((x) => x.id === user.permission);
  return <span className="badge badge-lavender">{p?.label ?? user.permission}</span>;
}

export const fullName = (u: ManagedUser) => [u.firstname, u.lastname].filter(Boolean).join(' ') || u.username;
