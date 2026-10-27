import { Link, useSearchParams } from 'react-router';
import { fullName } from '../components/Badges';
import { EmptyState } from '../components/EmptyState';
import { UserActions } from '../components/UserActions';
import { useApprovals, useProjects } from '../lib/queries';

export function AdminRequests() {
  const { data, isPending, error } = useApprovals();
  const { data: projects } = useProjects();
  // Kept in the URL so a filtered queue can be bookmarked or shared.
  const [params, setParams] = useSearchParams();
  const project = params.get('project') ?? '';

  const setProject = (value: string) => setParams(value ? { project: value } : {}, { replace: true });
  const shown = project ? data?.filter((p) => p.customer === project) : data;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Queue</p>
          <h1>Admin requests</h1>
          <p className="page-sub">Admins who asked for access and can’t sign in until you approve them.</p>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <select className="input" style={{ maxWidth: 220 }} aria-label="Project" value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="">All projects</option>
          {projects?.map((p) => <option key={p.customer} value={p.customer}>{p.customer}</option>)}
        </select>
        {project && <button type="button" className="btn btn-soft btn-sm" onClick={() => setProject('')}>Clear filter</button>}
      </div>

      {isPending && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error.message}</p>}
      {data?.length === 0 && <EmptyState icon="✅" title="Nothing waiting">New admin requests from any project show up here.</EmptyState>}
      {!!data?.length && shown?.length === 0 && (
        <EmptyState icon="✅" title={`Nothing waiting in ${project}`}>Other projects still have requests; clear the filter to see them.</EmptyState>
      )}
      {!!shown?.length && (
        <div className="table-wrap">
          <table className="table table-stack">
            <thead><tr><th>Admin</th><th>Project</th><th>Email</th><th /></tr></thead>
            <tbody>
              {shown.map(({ customer, user }) => (
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
