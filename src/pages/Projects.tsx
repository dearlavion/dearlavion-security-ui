import { Link } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { useProjects } from '../lib/queries';
import styles from './Pages.module.css';

export function Projects() {
  const { data, isPending, error } = useProjects();
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Projects</h1>
          <p className="page-sub">Every project signs in through the same auth service. Pick one to see its admins and users.</p>
        </div>
      </div>
      {isPending && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error.message}</p>}
      {data?.length === 0 && <EmptyState icon="🧭" title="No projects yet">Add a customer to the auth service’s CUSTOMERS setting.</EmptyState>}
      <div className={styles.grid}>
        {data?.map((p) => (
          <Link key={p.customer} to={`/projects/${encodeURIComponent(p.customer)}`} className={`card ${styles.project}`}>
            <h3>{p.customer}</h3>
            <div className={styles.stats}>
              <span><strong>{p.admins}</strong> admins</span>
              <span><strong>{p.users}</strong> users</span>
            </div>
            {p.pending > 0 && <span className="badge badge-marigold">{p.pending} waiting for approval</span>}
          </Link>
        ))}
      </div>
    </>
  );
}
