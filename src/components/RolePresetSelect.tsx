import { useRoles } from '../lib/queries';
import type { Permission } from '../lib/types';

/**
 * Fills in a permission from one of the project's roles. It only copies the role's permission: nothing is linked, so the
 * picker below can still be changed afterwards.
 */
export function RolePresetSelect({ customer, onPick }: { customer: string; onPick: (permission: Permission) => void }) {
  const { data } = useRoles({ customer, q: '', page: 1, size: 100 });
  const roles = data?.items ?? [];
  if (!customer || roles.length === 0) return null;
  return (
    <div className="form-field">
      <label htmlFor="role-preset">Start from a role <span className="muted">(optional)</span></label>
      <select id="role-preset" value="" onChange={(e) => {
        const found = roles.find((r) => r.role.id === e.target.value);
        if (found) onPick(found.role.permission);
      }}>
        <option value="">Choose a role…</option>
        {roles.map(({ role }) => <option key={role.id} value={role.id}>{role.name}</option>)}
      </select>
    </div>
  );
}
