import { useQuery } from '@tanstack/react-query';
import { getJobStatus } from '../api/jobs.api';
import { useJobStore } from '../stores/job.store';
import { useEffect } from 'react';

const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL_MS || '2000', 10);

export function useJobPolling(jobId: string | null) {
  const { setStatus, setProgress } = useJobStore();

  const query = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === 'PROCESSING' || status === 'PENDING') return POLL_INTERVAL;
      return false; // stop polling when terminal state reached
    },
  });

  useEffect(() => {
    if (query.data) {
      setStatus(query.data.status, query.data.errorMessage);
      setProgress(query.data.progress);
    }
  }, [query.data, setStatus, setProgress]);

  return query;
}
