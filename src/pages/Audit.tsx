import { EmptyState } from '../components/EmptyState';
import { useAudit } from '../lib/queries';

const ACTIONS: Record<string, string> = {
  APPROVAL: 'Approval',
  CREATE: 'User created',
  ACTIVATE: 'Restored',
  DEACTIVATE: 'Deactivated',
  ROLE_CREATE: 'Role created',
  ROLE_DELETE: 'Role deleted',
};

export function Audit() {
  const { data, isPending, error } = useAudit();
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">History</p>
          <h1>Audit log</h1>
          <p className="page-sub">The last 100 decisions made in this dashboard.</p>
        </div>
      </div>
      {isPending && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error.message}</p>}
      {data?.length === 0 && <EmptyState icon="📜" title="No activity yet">Approvals, rejections and deactivations are recorded here.</EmptyState>}
      {!!data?.length && (
        <div className="table-wrap">
          <table className="table table-stack">
            <thead><tr><th>When</th><th>By</th><th>Action</th><th>Project</th><th>Account</th><th>Change</th></tr></thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id}>
                  <td className="stack-title">{new Date(e.at).toLocaleString()}</td>
                  <td data-label="By">@{e.actor}</td>
                  <td data-label="Action">{ACTIONS[e.action] ?? e.action}</td>
                  <td data-label="Project">{e.customer}</td>
                  <td data-label="Account">@{e.target}</td>
                  <td data-label="Change" className="muted">{e.before} → {e.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
