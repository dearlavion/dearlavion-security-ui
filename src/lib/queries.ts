import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { toast } from '../components/toastStore';
import type { ApprovalStatus, AuditEntry, ManagedUser, PendingAdmin, Permission, PermissionRole, ProjectRolePage, ProjectSummary, ProjectUserPage, Role, UserPage } from './types';

export const useProjects = () => useQuery({ queryKey: ['projects'], queryFn: () => api<ProjectSummary[]>('/projects') });

export const useApprovals = () => useQuery({ queryKey: ['approvals'], queryFn: () => api<PendingAdmin[]>('/approvals') });

export const useAudit = () => useQuery({ queryKey: ['audit'], queryFn: () => api<AuditEntry[]>('/audit?limit=100') });

export interface UserFilter {
  role: 'ADMIN' | 'USER';
  status?: ApprovalStatus;
  q: string;
  /** 1-based, like the Pagination component. */
  page: number;
  size: number;
}

export function useProjectUsers(customer: string, f: UserFilter) {
  const params = new URLSearchParams({ role: f.role, page: String(f.page - 1), size: String(f.size) });
  if (f.status) params.set('status', f.status);
  if (f.q.trim()) params.set('q', f.q.trim());
  return useQuery({
    queryKey: ['users', customer, f],
    queryFn: () => api<UserPage>(`/projects/${encodeURIComponent(customer)}/users?${params}`),
    placeholderData: keepPreviousData,
  });
}

export interface AllUsersFilter {
  /** Empty means every project. */
  customer: string;
  role: '' | 'ADMIN' | 'USER';
  q: string;
  /** 1-based, like the Pagination component. */
  page: number;
  size: number;
}

/** Users across projects (or one), project by project. */
export function useUsers(f: AllUsersFilter) {
  const params = new URLSearchParams({ page: String(f.page - 1), size: String(f.size) });
  if (f.customer) params.set('customer', f.customer);
  if (f.role) params.set('role', f.role);
  if (f.q.trim()) params.set('q', f.q.trim());
  return useQuery({
    queryKey: ['users', 'all', f],
    queryFn: () => api<ProjectUserPage>(`/users?${params}`),
    placeholderData: keepPreviousData,
  });
}

/** Anything that changes who is approved or active makes every list and count stale. */
function useRefreshAfter<T, R = unknown>(mutationFn: (v: T) => Promise<R>, done: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(['projects', 'users', 'approvals', 'audit'].map((key) => qc.invalidateQueries({ queryKey: [key] })));
      toast.success(done);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

interface Decision {
  customer: string;
  username: string;
  status: ApprovalStatus;
  permission?: Permission;
}

export const useDecide = (done = 'Saved') =>
  useRefreshAfter<Decision>(
    (d) => api<ManagedUser>(`/projects/${encodeURIComponent(d.customer)}/users/${encodeURIComponent(d.username)}/approval`, {
      method: 'PATCH',
      json: { status: d.status, permission: d.permission },
    }),
    done,
  );

export const useSetActive = () =>
  useRefreshAfter<{ customer: string; username: string; active: boolean }>(
    (v) => api<ManagedUser>(`/projects/${encodeURIComponent(v.customer)}/users/${encodeURIComponent(v.username)}/active`, {
      method: 'PATCH',
      json: { active: v.active },
    }),
    'Saved',
  );

export interface NewUser {
  customer: string;
  username: string;
  email: string;
  password: string;
  firstname: string;
  role: Extract<Role, 'ADMIN' | 'USER'>;
  /** Only used for admins, who are approved on creation. */
  permission: Permission;
}

export const useCreateUser = () =>
  useRefreshAfter<NewUser, ManagedUser>(
    ({ customer, ...body }) => api<ManagedUser>(`/projects/${encodeURIComponent(customer)}/users`, {
      method: 'POST',
      json: { ...body, permission: body.role === 'ADMIN' ? body.permission : undefined },
    }),
    'User created',
  );

export interface RolesFilter {
  /** Empty means every project. */
  customer: string;
  q: string;
  /** 1-based, like the Pagination component. */
  page: number;
  size: number;
}

export function useRoles(f: RolesFilter) {
  const params = new URLSearchParams({ page: String(f.page - 1), size: String(f.size) });
  if (f.customer) params.set('customer', f.customer);
  if (f.q.trim()) params.set('q', f.q.trim());
  return useQuery({
    queryKey: ['roles', f],
    queryFn: () => api<ProjectRolePage>(`/roles?${params}`),
    placeholderData: keepPreviousData,
  });
}

export interface NewRole {
  customer: string;
  name: string;
  description: string;
  permission: Permission;
}

/** Role changes only touch role lists and the audit log, not the user lists. */
function useRoleMutation<T, R = unknown>(mutationFn: (v: T) => Promise<R>, done: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(['roles', 'audit'].map((key) => qc.invalidateQueries({ queryKey: [key] })));
      toast.success(done);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export const useCreateRole = () =>
  useRoleMutation<NewRole, PermissionRole>(
    ({ customer, ...body }) => api<PermissionRole>(`/projects/${encodeURIComponent(customer)}/roles`, { method: 'POST', json: body }),
    'Role created',
  );

export const useDeleteRole = () =>
  useRoleMutation<{ customer: string; id: string }>(
    (v) => api(`/projects/${encodeURIComponent(v.customer)}/roles/${encodeURIComponent(v.id)}`, { method: 'DELETE' }),
    'Role deleted',
  );
