import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { clampPage, Pagination } from '../components/Pagination';
import { useProjects } from '../lib/queries';

/**
 * The project list comes back whole (projects are the auth service's CUSTOMERS setting, so there are few), which is why
 * search and paging are done here rather than asking the API for pages like the user lists do.
 */
export function Projects() {
  const navigate = useNavigate();
  const { data, isPending, error } = useProjects();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((p) => p.customer.toLowerCase().includes(q));
  }, [data, search]);

  useEffect(() => setPage((p) => clampPage(p, size, matches.length)), [matches.length, size]);

  const rows = matches.slice((page - 1) * size, page * size);
  const open = (customer: string) => navigate(`/projects/${encodeURIComponent(customer)}`);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Projects</h1>
          <p className="page-sub">Every project signs in through the same auth service. Pick one to see its admins and users.</p>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 320 }} type="search" placeholder="Search projects" aria-label="Search projects"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {isPending && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error.message}</p>}
      {data?.length === 0 && <EmptyState icon="🧭" title="No projects yet">Add a customer to the auth service’s CUSTOMERS setting.</EmptyState>}
      {!!data?.length && matches.length === 0 && <EmptyState icon="🔎" title="No projects found">Try a different search.</EmptyState>}

      {matches.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="table table-stack">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Admins</th>
                  <th>Users</th>
                  <th>Waiting for approval</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.customer} className="clickable" onClick={() => open(p.customer)}>
                    <td className="stack-title">
                      {/* The row is clickable for the mouse; the link is what keyboards and screen readers use. */}
                      <Link to={`/projects/${encodeURIComponent(p.customer)}`} onClick={(e) => e.stopPropagation()}>
                        <strong>{p.customer}</strong>
                      </Link>
                    </td>
                    <td data-label="Admins">{p.admins}</td>
                    <td data-label="Users">{p.users}</td>
                    <td data-label="Waiting for approval">
                      {p.pending > 0 ? <span className="badge badge-marigold">{p.pending} pending</span> : <span className="muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={size} total={matches.length} noun="projects"
            onPage={setPage} onPageSize={(s) => { setSize(s); setPage(1); }} />
        </>
      )}
    </>
  );
}
