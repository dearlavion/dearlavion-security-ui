import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { fullName, PermissionBadge, StatusBadge } from '../components/Badges';
import { EmptyState } from '../components/EmptyState';
import { clampPage, Pagination } from '../components/Pagination';
import { UserActions } from '../components/UserActions';
import { useProjectUsers } from '../lib/queries';
import type { ApprovalStatus } from '../lib/types';
import styles from './Pages.module.css';

const STATUSES: ApprovalStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function ProjectDetail() {
  const { customer = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'users' ? 'USER' : 'ADMIN';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ApprovalStatus | ''>('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const q = useDebounced(search);

  const { data, isPending, isFetching, error } = useProjectUsers(customer, {
    role: tab,
    status: tab === 'ADMIN' && status ? status : undefined,
    q,
    page,
    size,
  });
  // A search or a decision can shrink the list below the current page.
  useEffect(() => {
    if (data) setPage((p) => clampPage(p, size, data.total));
  }, [data, size]);

  const switchTab = (t: 'admins' | 'users') => {
    setParams(t === 'users' ? { tab: 'users' } : {});
    setPage(1);
    setStatus('');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><Link to="/projects">Projects</Link> /</p>
          <h1>{customer}</h1>
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'ADMIN'} className={tab === 'ADMIN' ? styles.tabOn : ''} onClick={() => switchTab('admins')}>Admins</button>
        <button type="button" role="tab" aria-selected={tab === 'USER'} className={tab === 'USER' ? styles.tabOn : ''} onClick={() => switchTab('users')}>Users</button>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 320 }} type="search" placeholder="Search name, username or email" aria-label="Search"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {tab === 'ADMIN' && (
          <select className="input" style={{ maxWidth: 180 }} aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value as ApprovalStatus | ''); setPage(1); }}>
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
        )}
        {isFetching && !isPending && <span className="muted">Updating…</span>}
      </div>

      {error && <p className="form-error">{error.message}</p>}
      {isPending && <p className="muted">Loading…</p>}
      {data && data.total === 0 && (
        <EmptyState icon={tab === 'ADMIN' ? '🛡️' : '👥'} title={`No ${tab === 'ADMIN' ? 'admins' : 'users'} found`}>
          {q || status ? 'Try a different search or filter.' : tab === 'ADMIN' ? 'Admins appear here once they request access.' : 'Nobody has signed up to this project yet.'}
        </EmptyState>
      )}
      {data && data.total > 0 && (
        <>
          <div className="table-wrap">
            <table className="table table-stack">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {tab === 'ADMIN' && <><th>Status</th><th>Permission</th></>}
                  <th>Account</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.username}>
                    <td className="stack-title"><strong>{fullName(u)}</strong><div className="muted">@{u.username}</div></td>
                    <td data-label="Email">{u.email}</td>
                    {tab === 'ADMIN' && (
                      <>
                        <td data-label="Status"><StatusBadge status={u.status} /></td>
                        <td data-label="Permission"><PermissionBadge user={u} /></td>
                      </>
                    )}
                    <td data-label="Account">{u.active ? <span className="badge badge-green">Active</span> : <span className="badge">Deactivated</span>}</td>
                    <td><UserActions customer={customer} user={u} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={size} total={data.total} noun={tab === 'ADMIN' ? 'admins' : 'users'}
            onPage={setPage} onPageSize={(s) => { setSize(s); setPage(1); }} />
        </>
      )}
    </>
  );
}
