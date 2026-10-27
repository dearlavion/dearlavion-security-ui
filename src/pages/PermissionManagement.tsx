import { useEffect, useState } from 'react';
import { fullName, StatusBadge } from '../components/Badges';
import { EmptyState } from '../components/EmptyState';
import { clampPage, Pagination } from '../components/Pagination';
import { Switch } from '../components/Switch';
import { useDecide, useProjects, useProjectUsers } from '../lib/queries';
import type { ManagedUser, Permission } from '../lib/types';

const toPermission = (read: boolean, modify: boolean): Permission =>
  read && modify ? 'BOTH' : read ? 'READ' : modify ? 'MODIFY' : 'NONE';

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Turn Read and Modify on or off for each approved admin of a project. Both off keeps the account but blocks all access. */
export function PermissionManagement() {
  const { data: projects } = useProjects();
  const [chosen, setChosen] = useState('');
  const customer = chosen || projects?.[0]?.customer || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const q = useDebounced(search);
  const decide = useDecide('Permission updated');

  const { data, isPending, error } = useProjectUsers(customer, { role: 'ADMIN', status: 'APPROVED', q, page, size });
  useEffect(() => {
    if (data) setPage((p) => clampPage(p, size, data.total));
  }, [data, size]);

  const toggle = (u: ManagedUser, kind: 'read' | 'modify', on: boolean) => {
    const read = kind === 'read' ? on : u.permission === 'READ' || u.permission === 'BOTH';
    const modify = kind === 'modify' ? on : u.permission === 'MODIFY' || u.permission === 'BOTH';
    decide.mutate({ customer, username: u.username, status: 'APPROVED', permission: toPermission(read, modify) });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Access</p>
          <h1>Permission management</h1>
          <p className="page-sub">Switch what each approved admin can do in a project. With both off, the account stays but has no access.</p>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <select className="input" style={{ maxWidth: 220 }} aria-label="Project" value={customer} onChange={(e) => { setChosen(e.target.value); setPage(1); }}>
          {projects?.map((p) => <option key={p.customer} value={p.customer}>{p.customer}</option>)}
        </select>
        <input className="input" style={{ maxWidth: 320 }} type="search" placeholder="Search name, username or email" aria-label="Search"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {error && <p className="form-error">{error.message}</p>}
      {(isPending || !customer) && !error && <p className="muted">Loading…</p>}
      {data && data.total === 0 && (
        <EmptyState icon="🔑" title="No approved admins">
          {q ? 'Try a different search.' : 'Approve admin requests first; approved admins show up here.'}
        </EmptyState>
      )}
      {data && data.total > 0 && (
        <>
          <div className="table-wrap">
            <table className="table table-stack">
              <thead><tr><th>Admin</th><th>Email</th><th>Status</th><th>Read</th><th>Modify</th></tr></thead>
              <tbody>
                {data.items.map((u) => {
                  const read = u.permission === 'READ' || u.permission === 'BOTH';
                  const modify = u.permission === 'MODIFY' || u.permission === 'BOTH';
                  return (
                    <tr key={u.username}>
                      <td className="stack-title"><strong>{fullName(u)}</strong><div className="muted">@{u.username}</div></td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Status"><StatusBadge status={u.status} /></td>
                      <td data-label="Read"><Switch label={`Read access for ${u.username}`} checked={read} disabled={decide.isPending} onChange={(on) => toggle(u, 'read', on)} /></td>
                      <td data-label="Modify"><Switch label={`Modify access for ${u.username}`} checked={modify} disabled={decide.isPending} onChange={(on) => toggle(u, 'modify', on)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={size} total={data.total} noun="admins" onPage={setPage} onPageSize={(s) => { setSize(s); setPage(1); }} />
        </>
      )}
    </>
  );
}
