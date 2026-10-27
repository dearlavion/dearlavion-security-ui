import { refreshSession, toError } from './authApi';
import { useSession } from './session';

const BASE = '/api/v1/superadmin';

/** Calls the superadmin API with the in-memory access token, refreshing it once if it just expired. */
export async function api<T>(path: string, init: { method?: string; json?: unknown } = {}): Promise<T> {
  const send = () => {
    const headers = new Headers();
    const token = useSession.getState().accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (init.json !== undefined) headers.set('Content-Type', 'application/json');
    return fetch(`${BASE}${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      credentials: 'same-origin',
    });
  };
  let res = await send();
  if (res.status === 401 && (await refreshSession())) res = await send();
  if (!res.ok) throw await toError(res);
  return (await res.json()) as T;
}
