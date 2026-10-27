import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Overlay } from '../components/Overlay';
import { login as loginRequest } from '../lib/authApi';
import { ApiError } from '../lib/errors';
import { useSession } from '../lib/session';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useSession((s) => s.signIn);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/projects';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await loginRequest(login, password);
      signIn(res.accessToken, res.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not log in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay eyebrow="Superadmin" title="Log in" onClose={() => undefined}>
      <form onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="login">Email or username</label>
          <input id="login" value={login} onChange={(e) => setLogin(e.target.value)} required autoComplete="username" />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </Overlay>
  );
}
