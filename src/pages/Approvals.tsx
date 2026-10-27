import { Link } from 'react-router';
import { fullName } from '../components/Badges';
import { EmptyState } from '../components/EmptyState';
import { UserActions } from '../components/UserActions';
import { useApprovals } from '../lib/queries';

export function Approvals() {
  const { data, isPending, error } = useApprovals();
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Queue</p>
          <h1>Approvals</h1>
          <p className="page-sub">Admins who asked for access and can’t sign in until you approve them.</p>
        </div>
      </div>
      {isPending && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error.message}</p>}
      {data?.length === 0 && <EmptyState icon="✅" title="Nothing waiting">New admin requests from any project show up here.</EmptyState>}
      {!!data?.length && (
        <div className="table-wrap">
          <table className="table table-stack">
            <thead><tr><th>Admin</th><th>Project</th><th>Email</th><th /></tr></thead>
            <tbody>
              {data.map(({ customer, user }) => (
                <tr key={`${customer}/${user.username}`}>
                  <td className="stack-title"><strong>{fullName(user)}</strong><div className="muted">@{user.username}</div></td>
                  <td data-label="Project"><Link to={`/projects/${encodeURIComponent(customer)}`}><span className="badge badge-lavender">{customer}</span></Link></td>
                  <td data-label="Email">{user.email}</td>
                  <td><UserActions customer={customer} user={user} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
