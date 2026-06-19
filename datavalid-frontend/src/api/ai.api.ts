import { apiClient } from './client';
import {
  type AIMappingResponse,
  type FixSuggestionsResponse,
  type AISummaryResponse,
  type PreviewHeadersResponse,
} from '../types/api';

export async function previewHeaders(jobId: string): Promise<PreviewHeadersResponse> {
  const res = await apiClient.get<PreviewHeadersResponse>(`/api/ai/preview-headers/${jobId}`);
  return res.data;
}

export async function getColumnMapping(
  jobId: string,
  headers: string[],
  sample: Record<string, string>[]
): Promise<AIMappingResponse> {
  const res = await apiClient.post<AIMappingResponse>('/api/ai/column-mapping', {
    jobId, headers, sample,
  });
  return res.data;
}

export async function getFixSuggestions(
  jobId: string,
  rows: Array<{
    rowNumber: number;
    rowData: Record<string, string>;
    errors: Array<{ field: string; code: string; message: string }>;
  }>
): Promise<FixSuggestionsResponse> {
  const res = await apiClient.post<FixSuggestionsResponse>('/api/ai/fix-suggestions', {
    jobId, rows,
  });
  return res.data;
}

export async function getAISummary(jobId: string): Promise<AISummaryResponse> {
  const res = await apiClient.get<AISummaryResponse>(`/api/ai/summary/${jobId}`);
  return res.data;
}
