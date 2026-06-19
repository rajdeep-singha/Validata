import { create } from 'zustand';

export type AppStep = 'upload' | 'mapping' | 'validation' | 'insights' | 'download';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIStore {
  activeStep: AppStep;
  toasts: Toast[];
  setStep: (step: AppStep) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeStep: 'upload',
  toasts: [],
  setStep: (activeStep) => set({ activeStep }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `${Date.now()}-${Math.random()}` }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
