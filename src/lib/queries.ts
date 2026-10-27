import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { toast } from '../components/toastStore';
import type { ApprovalStatus, AuditEntry, ManagedUser, PendingAdmin, Permission, ProjectSummary, UserPage } from './types';

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

/** Anything that changes who is approved or active makes every list and count stale. */
function useRefreshAfter<T>(mutationFn: (v: T) => Promise<unknown>, done: string) {
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
