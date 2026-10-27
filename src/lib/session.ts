import { create } from 'zustand';
import type { User } from './types';

/**
 * The access token lives only in memory; the refresh token is an httpOnly cookie the browser sends to /api/v1/auth/*.
 * A page reload therefore starts "unknown" and restores the session via refresh.
 */
interface SessionState {
  status: 'unknown' | 'authenticated' | 'anonymous';
  accessToken: string | null;
  user: User | null;
  signIn: (accessToken: string, user: User) => void;
  signOut: () => void;
}

export const useSession = create<SessionState>((set) => ({
  status: 'unknown',
  accessToken: null,
  user: null,
  signIn: (accessToken, user) => set({ status: 'authenticated', accessToken, user }),
  signOut: () => set({ status: 'anonymous', accessToken: null, user: null }),
}));
