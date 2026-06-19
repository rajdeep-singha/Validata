import { useMutation } from '@tanstack/react-query';
import { downloadJobFile } from '../api/download.api';
import { useUIStore } from '../stores/ui.store';

export function useDownload() {
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (jobId: string) => downloadJobFile(jobId),
    onSuccess: () => {
      addToast({ type: 'success', message: 'Download started' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: `Download failed: ${err.message}` });
    },
  });
}
