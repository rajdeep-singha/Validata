import { create } from 'zustand';
import { type JobStatus, type JobProgress } from '../types/domain';

interface JobStore {
  jobId: string | null;
  filename: string | null;
  status: JobStatus | null;
  progress: JobProgress | null;
  errorMessage: string | null;
  setJob: (jobId: string, filename: string) => void;
  setStatus: (status: JobStatus, errorMessage?: string | null) => void;
  setProgress: (progress: JobProgress) => void;
  reset: () => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobId: null,
  filename: null,
  status: null,
  progress: null,
  errorMessage: null,
  setJob: (jobId, filename) => set({ jobId, filename, status: 'PENDING', errorMessage: null }),
  setStatus: (status, errorMessage = null) => set({ status, errorMessage }),
  setProgress: (progress) => set({ progress }),
  reset: () => set({ jobId: null, filename: null, status: null, progress: null, errorMessage: null }),
}));
