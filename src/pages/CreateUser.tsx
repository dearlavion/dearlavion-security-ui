import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { PermissionPicker } from '../components/PermissionPicker';
import { RolePresetSelect } from '../components/RolePresetSelect';
import { ApiError } from '../lib/errors';
import { useCreateUser, useProjects } from '../lib/queries';
import type { Permission } from '../lib/types';
import styles from './Pages.module.css';

const USERNAME = /^[a-zA-Z0-9_.-]{3,40}$/;
const EMPTY = { username: '', email: '', firstname: '', password: '' };

/** A superadmin creates an account straight in a project. Admins are approved on the spot with the permission chosen here. */
export function CreateUser() {
  const { data: projects } = useProjects();
  const create = useCreateUser();
  const [chosen, setChosen] = useState('');
  const customer = chosen || projects?.[0]?.customer || '';
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [permission, setPermission] = useState<Permission>('READ');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ customer: string; username: string; role: string } | null>(null);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreated(null);
    if (!customer) return setError('Choose a project');
    if (!USERNAME.test(form.username.trim())) return setError('Username must be 3-40 letters, numbers, dots, dashes or underscores');
    if (!form.email.includes('@')) return setError('Enter a valid email');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    create.mutate({ customer, role, permission, ...form }, {
      onSuccess: (user) => {
        setCreated({ customer, username: user.username, role });
        setForm(EMPTY);
      },
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not create the user'),
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Accounts</p>
          <h1>Create user</h1>
          <p className="page-sub">Add an admin or a regular user to a project. Admins can sign in straight away with the access you pick.</p>
        </div>
      </div>

      <form className="card" style={{ maxWidth: 560 }} onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="project">Project</label>
          <select id="project" value={customer} onChange={(e) => setChosen(e.target.value)}>
            {projects?.map((p) => <option key={p.customer} value={p.customer}>{p.customer}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label>Account type</label>
          <div className={styles.tabs} role="radiogroup" aria-label="Account type" style={{ alignSelf: 'flex-start', marginBottom: 0 }}>
            <button type="button" role="radio" aria-checked={role === 'USER'} className={role === 'USER' ? styles.tabOn : ''} onClick={() => setRole('USER')}>User</button>
            <button type="button" role="radio" aria-checked={role === 'ADMIN'} className={role === 'ADMIN' ? styles.tabOn : ''} onClick={() => setRole('ADMIN')}>Admin</button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" value={form.username} onChange={set('username')} required autoComplete="off" />
          </div>
          <div className="form-field">
            <label htmlFor="firstname">Name <span className="muted">(optional)</span></label>
            <input id="firstname" value={form.firstname} onChange={set('firstname')} autoComplete="off" />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={set('email')} required autoComplete="off" />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
          <span className="hint">At least 8 characters. Share it with them securely; they can change it after signing in.</span>
        </div>

        {role === 'ADMIN' && (
          <div className="form-field">
            <RolePresetSelect customer={customer} onPick={setPermission} />
            <label>Access</label>
            <PermissionPicker value={permission} onChange={setPermission} />
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
        {created && (
          <p className="form-error" style={{ background: 'var(--tint-green)', color: '#4f7a3f' }}>
            Created @{created.username} as {created.role === 'ADMIN' ? 'an admin' : 'a user'} in {created.customer}.{' '}
            <Link to={`/projects/${encodeURIComponent(created.customer)}${created.role === 'USER' ? '?tab=users' : ''}`}>View project</Link>
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : `Create ${role === 'ADMIN' ? 'admin' : 'user'}`}
        </button>
      </form>
    </>
  );
}
