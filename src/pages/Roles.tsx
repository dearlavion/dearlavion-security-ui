import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { PERMISSIONS } from '../components/Badges';
import { ConfirmOverlay } from '../components/ConfirmOverlay';
import { EmptyState } from '../components/EmptyState';
import { clampPage, Pagination } from '../components/Pagination';
import { useDeleteRole, useProjects, useRoles } from '../lib/queries';
import type { ProjectRole } from '../lib/types';

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function Roles() {
  const { data: projects } = useProjects();
  const [customer, setCustomer] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [deleting, setDeleting] = useState<ProjectRole | null>(null);
  const q = useDebounced(search);
  const remove = useDeleteRole();

  const { data, isPending, isFetching, error } = useRoles({ customer, q, page, size });
  useEffect(() => {
    if (data) setPage((p) => clampPage(p, size, data.total));
  }, [data, size]);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Roles</p>
          <h1>Roles</h1>
          <p className="page-sub">Named access presets, per project.</p>
        </div>
        <Link to="/roles/new" className="btn btn-primary">Create role</Link>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <select className="input" style={{ maxWidth: 200 }} aria-label="Project" value={customer} onChange={(e) => { setCustomer(e.target.value); setPage(1); }}>
          <option value="">All projects</option>
          {projects?.map((p) => <option key={p.customer} value={p.customer}>{p.customer}</option>)}
        </select>
        <input className="input" style={{ maxWidth: 320 }} type="search" placeholder="Search roles" aria-label="Search roles"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {isFetching && !isPending && <span className="muted">Updating…</span>}
      </div>

      {error && <p className="form-error">{error.message}</p>}
      {isPending && <p className="muted">Loading…</p>}
      {data && data.total === 0 && (
        <EmptyState icon="🏷️" title="No roles found">
          {q || customer ? 'Try a different search or project.' : <>No roles yet. <Link to="/roles/new">Create the first one.</Link></>}
        </EmptyState>
      )}
      {data && data.total > 0 && (
        <>
          <div className="table-wrap">
            <table className="table table-stack">
              <thead><tr><th>Role</th><th>Project</th><th>Access</th><th>Created</th><th /></tr></thead>
              <tbody>
                {data.items.map((item) => {
                  const { role } = item;
                  return (
                    <tr key={`${item.customer}/${role.id}`}>
                      <td className="stack-title"><strong>{role.name}</strong>{role.description && <div className="muted">{role.description}</div>}</td>
                      <td data-label="Project"><Link to={`/projects/${encodeURIComponent(item.customer)}`}><span className="badge badge-lavender">{item.customer}</span></Link></td>
                      <td data-label="Access"><span className="badge badge-lavender">{PERMISSIONS.find((p) => p.id === role.permission)?.label ?? role.permission}</span></td>
                      <td data-label="Created" className="muted">{new Date(role.createdAt).toLocaleDateString()} · @{role.createdBy}</td>
                      <td><button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleting(item)}>Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={size} total={data.total} noun="roles" onPage={setPage} onPageSize={(s) => { setSize(s); setPage(1); }} />
        </>
      )}

      {deleting && (
        <ConfirmOverlay
          title="Delete role?"
          message={`“${deleting.role.name}” is removed from ${deleting.customer}. Admins who were given its access keep it; nothing else changes.`}
          confirmLabel="Delete"
          busy={remove.isPending}
          onClose={() => setDeleting(null)}
          onConfirm={() => remove.mutate({ customer: deleting.customer, id: deleting.role.id }, { onSuccess: () => setDeleting(null) })}
        />
      )}
    </>
  );
}
