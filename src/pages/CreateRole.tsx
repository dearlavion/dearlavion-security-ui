import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { PermissionPicker } from '../components/PermissionPicker';
import { ApiError } from '../lib/errors';
import { useCreateRole, useProjects } from '../lib/queries';
import type { Permission } from '../lib/types';

/** A role is a named Read/Modify preset for one project, handy when approving or creating admins. */
export function CreateRole() {
  const { data: projects } = useProjects();
  const create = useCreateRole();
  const [chosen, setChosen] = useState('');
  const customer = chosen || projects?.[0]?.customer || '';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permission, setPermission] = useState<Permission>('READ');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ customer: string; name: string } | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreated(null);
    if (!customer) return setError('Choose a project');
    if (name.trim().length < 2) return setError('Give the role a name of at least 2 characters');
    create.mutate({ customer, name, description, permission }, {
      onSuccess: (role) => {
        setCreated({ customer, name: role.name });
        setName('');
        setDescription('');
      },
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not create the role'),
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Roles</p>
          <h1>Create role</h1>
          <p className="page-sub">A named set of access for one project. Pick it when approving or creating an admin to fill in their permission.</p>
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
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="e.g. Content editor" autoComplete="off" />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description <span className="muted">(optional)</span></label>
          <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} autoComplete="off" />
        </div>
        <div className="form-field">
          <label>Access</label>
          <PermissionPicker value={permission} onChange={setPermission} />
        </div>

        {error && <p className="form-error">{error}</p>}
        {created && (
          <p className="form-error" style={{ background: 'var(--tint-green)', color: '#4f7a3f' }}>
            Created “{created.name}” in {created.customer}. <Link to="/roles">View roles</Link>
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create role'}
        </button>
      </form>
    </>
  );
}
