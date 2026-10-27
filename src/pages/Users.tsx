import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fullName, PermissionBadge, StatusBadge } from '../components/Badges';
import { EmptyState } from '../components/EmptyState';
import { clampPage, Pagination } from '../components/Pagination';
import { UserActions } from '../components/UserActions';
import { useProjects, useUsers } from '../lib/queries';

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Everyone in every project, narrowed by project, role or a search. */
export function Users() {
  const { data: projects } = useProjects();
  const [customer, setCustomer] = useState('');
  const [role, setRole] = useState<'' | 'ADMIN' | 'USER'>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const q = useDebounced(search);

  const { data, isPending, isFetching, error } = useUsers({ customer, role, q, page, size });
  useEffect(() => {
    if (data) setPage((p) => clampPage(p, size, data.total));
  }, [data, size]);

  const reset = () => setPage(1);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Accounts</p>
          <h1>Users</h1>
          <p className="page-sub">Admins and users across every project.</p>
        </div>
        <Link to="/users/new" className="btn btn-primary">Create user</Link>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <select className="input" style={{ maxWidth: 200 }} aria-label="Project" value={customer} onChange={(e) => { setCustomer(e.target.value); reset(); }}>
          <option value="">All projects</option>
          {projects?.map((p) => <option key={p.customer} value={p.customer}>{p.customer}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 200 }} aria-label="Role" value={role} onChange={(e) => { setRole(e.target.value as '' | 'ADMIN' | 'USER'); reset(); }}>
          <option value="">Admins and users</option>
          <option value="ADMIN">Admins</option>
          <option value="USER">Users</option>
        </select>
        <input className="input" style={{ maxWidth: 320 }} type="search" placeholder="Search name, username or email" aria-label="Search"
          value={search} onChange={(e) => { setSearch(e.target.value); reset(); }} />
        {isFetching && !isPending && <span className="muted">Updating…</span>}
      </div>

      {error && <p className="form-error">{error.message}</p>}
      {isPending && <p className="muted">Loading…</p>}
      {data && data.total === 0 && (
        <EmptyState icon="👥" title="No users found">
          {q || customer || role ? 'Try a different search or filter.' : 'Nobody has signed up to any project yet.'}
        </EmptyState>
      )}
      {data && data.total > 0 && (
        <>
          <div className="table-wrap">
            <table className="table table-stack">
              <thead>
                <tr><th>Name</th><th>Project</th><th>Email</th><th>Role</th><th>Access</th><th>Account</th><th /></tr>
              </thead>
              <tbody>
                {data.items.map(({ customer: project, user: u }) => {
                  const isAdmin = u.activeProfile === 'ADMIN' || u.activeProfile === 'STAFF';
                  return (
                    <tr key={`${project}/${u.username}`}>
                      <td className="stack-title"><strong>{fullName(u)}</strong><div className="muted">@{u.username}</div></td>
                      <td data-label="Project"><Link to={`/projects/${encodeURIComponent(project)}`}><span className="badge badge-lavender">{project}</span></Link></td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Role">{isAdmin ? 'Admin' : 'User'}</td>
                      <td data-label="Access">
                        {isAdmin ? <><StatusBadge status={u.status} /> <PermissionBadge user={u} /></> : <span className="muted">—</span>}
                      </td>
                      <td data-label="Account">{u.active ? <span className="badge badge-green">Active</span> : <span className="badge">Deactivated</span>}</td>
                      <td><UserActions customer={project} user={u} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={size} total={data.total} noun="users" onPage={setPage} onPageSize={(s) => { setSize(s); reset(); }} />
        </>
      )}
    </>
  );
}
