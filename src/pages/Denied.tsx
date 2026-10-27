import { useNavigate } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { logout } from '../lib/authApi';

/** A signed-in account that isn't a superadmin. The API refuses it too; this just explains why. */
export function Denied() {
  const navigate = useNavigate();
  return (
    <div className="center-page">
      <EmptyState icon="🔒" title="Superadmins only">
        <p>This account can’t use the security dashboard.</p>
        <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={async () => { await logout(); navigate('/login'); }}>
          Log out
        </button>
      </EmptyState>
    </div>
  );
}
