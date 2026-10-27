export type Role = 'SUPERADMIN' | 'ADMIN' | 'STAFF' | 'USER';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Permission = 'NONE' | 'READ' | 'MODIFY' | 'BOTH';

/** The signed-in superadmin. */
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

/** An account in one of the projects, as the superadmin API returns it. */
export interface ManagedUser {
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  activeProfile: Role;
  active: boolean;
  status: ApprovalStatus;
  permission: Permission;
}

export interface ProjectSummary {
  customer: string;
  admins: number;
  users: number;
  pending: number;
}

export interface ProjectUser {
  customer: string;
  user: ManagedUser;
}

export interface ProjectUserPage {
  items: ProjectUser[];
  total: number;
  page: number;
  size: number;
}

/** A per-project permission preset (not the account Role above). */
export interface PermissionRole {
  id: string;
  name: string;
  description: string | null;
  permission: Permission;
  createdBy: string;
  createdAt: string;
}

export interface ProjectRole {
  customer: string;
  role: PermissionRole;
}

export interface ProjectRolePage {
  items: ProjectRole[];
  total: number;
  page: number;
  size: number;
}

export interface PendingAdmin {
  customer: string;
  user: ManagedUser;
}

export interface UserPage {
  items: ManagedUser[];
  total: number;
  page: number;
  size: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  customer: string;
  target: string;
  before: string | null;
  after: string | null;
}
