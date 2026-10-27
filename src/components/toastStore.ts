import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';

interface ToastState {
  toast: { id: number; kind: ToastKind; message: string } | null;
  show: (kind: ToastKind, message: string) => void;
  clear: () => void;
}

export const useToast = create<ToastState>((set) => ({
  toast: null,
  show: (kind, message) => set({ toast: { id: Date.now(), kind, message } }),
  clear: () => set({ toast: null }),
}));

export const toast = {
  success: (m: string) => useToast.getState().show('success', m),
  error: (m: string) => useToast.getState().show('error', m),
  info: (m: string) => useToast.getState().show('info', m),
};
