import { useMutation } from '@tanstack/react-query';
import { getFixSuggestions } from '../api/ai.api';
import { useFixStore } from '../stores/fix.store';
import { useUIStore } from '../stores/ui.store';
import { type JobResultRow } from '../types/domain';

export function useFixSuggestions(jobId: string) {
  const { setSuggestions } = useFixStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (rows: JobResultRow[]) =>
      getFixSuggestions(
        jobId,
        rows.map((r) => ({
          rowNumber: r.rowNumber,
          rowData: r.rowData,
          errors: (r.errors ?? []).map((e) => ({
            field: e.field,
            code: e.code,
            message: e.message,
          })),
        }))
      ),
    onSuccess: (data) => {
      data.suggestions.forEach(({ rowNumber, fixes }) => {
        setSuggestions(rowNumber, fixes);
      });
      addToast({ type: 'success', message: `AI suggestions ready for ${data.suggestions.length} rows` });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: `Fix suggestions failed: ${err.message}` });
    },
  });
}
