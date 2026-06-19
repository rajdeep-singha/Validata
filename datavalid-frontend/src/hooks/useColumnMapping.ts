import { useMutation } from '@tanstack/react-query';
import { previewHeaders, getColumnMapping } from '../api/ai.api';
import { useMappingStore } from '../stores/mapping.store';
import { useUIStore } from '../stores/ui.store';

export function useColumnMapping() {
  const { setMappings } = useMappingStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const preview = await previewHeaders(jobId);
      const mapping = await getColumnMapping(jobId, preview.headers, preview.sample);
      return mapping;
    },
    onSuccess: (data) => {
      setMappings(data.mappings, data.unmappedHeaders);
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: `AI mapping failed: ${err.message}` });
    },
  });
}
