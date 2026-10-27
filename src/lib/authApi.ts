import { ApiError } from './errors';
import { useSession } from './session';
import type { AuthResponse, Role } from './types';

/**
 * Superadmins are accounts of the shared auth service's security tenant. /api/v1/auth/* is proxied to it (see vite.config.ts
 * and nginx.conf), the tenant goes out as X-Customer, and the refresh token is its httpOnly cookie.
 */
const AUTH = '/api/v1/auth';
const CUSTOMER = import.meta.env.VITE_AUTH_CUSTOMER ?? 'security';

interface SessionBody {
  token: string;
  expiresIn: number;
  user: { id: string; username: string; email: string; firstname: string | null; activeProfile: Role };
}

const toAuthResponse = (b: SessionBody): AuthResponse => ({
  accessToken: b.token,
  expiresIn: b.expiresIn,
  user: {
    id: b.user.id,
    username: b.user.username,
    email: b.user.email,
    displayName: b.user.firstname?.trim() || b.user.username,
    role: b.user.activeProfile,
  },
});

export async function toError(res: Response): Promise<ApiError> {
  let message = res.statusText || 'Something went wrong';
  try {
    const body = await res.json();
    if (typeof body.message === 'string') message = body.message;
  } catch {
    /* keep the status text */
  }
  if (res.status >= 502) return new ApiError(res.status, 'UNAVAILABLE', 'The auth service isn’t reachable, try again shortly');
  return new ApiError(res.status, 'ERROR', message);
}

export function authFetch(path: string, init: RequestInit & { json?: unknown } = {}) {
  const headers = new Headers(init.headers);
  headers.set('X-Customer', CUSTOMER);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(init.json);
  }
  return fetch(`${AUTH}${path}`, { ...init, headers, body, credentials: 'same-origin' });
}

let refreshing: Promise<boolean> | null = null;

/** Exchanges the refresh cookie for a new access token. Concurrent callers share one request. */
export function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await authFetch('/session/refresh', { method: 'POST' });
      if (!res.ok) {
        useSession.getState().signOut();
        return false;
      }
      const body = toAuthResponse((await res.json()) as SessionBody);
      useSession.getState().signIn(body.accessToken, body.user);
      return true;
    } catch {
      useSession.getState().signOut();
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** `loginName` is an email or a username; both are matched in lower case. */
export async function login(loginName: string, password: string): Promise<AuthResponse> {
  const who = loginName.trim().toLowerCase();
  const res = await authFetch('/session/login', {
    method: 'POST',
    json: who.includes('@') ? { email: who, password } : { username: who, password },
  });
  if (!res.ok) throw await toError(res);
  return toAuthResponse((await res.json()) as SessionBody);
}

export async function logout(): Promise<void> {
  await authFetch('/session/logout', { method: 'POST' }).catch(() => undefined);
  useSession.getState().signOut();
}
