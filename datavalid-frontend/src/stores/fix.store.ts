import { create } from 'zustand';
import { type FixEntry } from '../types/api';

interface FixStore {
  suggestions: Record<number, FixEntry[]>;  // keyed by rowNumber
  approvals: Record<string, boolean>;        // keyed by `${rowNumber}-${field}`
  setSuggestions: (rowNumber: number, fixes: FixEntry[]) => void;
  approve: (rowNumber: number, field: string) => void;
  reject: (rowNumber: number, field: string) => void;
  reset: () => void;
}

export const useFixStore = create<FixStore>((set) => ({
  suggestions: {},
  approvals: {},

  setSuggestions: (rowNumber, fixes) =>
    set((state) => ({
      suggestions: { ...state.suggestions, [rowNumber]: fixes },
    })),

  approve: (rowNumber, field) =>
    set((state) => ({
      approvals: { ...state.approvals, [`${rowNumber}-${field}`]: true },
    })),

  reject: (rowNumber, field) =>
    set((state) => ({
      approvals: { ...state.approvals, [`${rowNumber}-${field}`]: false },
    })),

  reset: () => set({ suggestions: {}, approvals: {} }),
}));
