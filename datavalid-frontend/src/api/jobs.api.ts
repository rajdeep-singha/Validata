import { apiClient } from './client';
import { type JobStatusResponse, type JobResultsResponse } from '../types/api';

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await apiClient.get<JobStatusResponse>(`/api/jobs/${jobId}/status`);
  return res.data;
}

export async function getJobResults(
  jobId: string,
  page = 1,
  limit = 100,
  filter?: 'VALID' | 'INVALID'
): Promise<JobResultsResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (filter) params.filter = filter;
  const res = await apiClient.get<JobResultsResponse>(`/api/jobs/${jobId}/results`, { params });
  return res.data;
}

export async function startValidation(
  jobId: string,
  confirmedMappings: Array<{ uploadedHeader: string; mappedField: string }>
): Promise<{ jobId: string; status: string; message: string }> {
  const res = await apiClient.post(`/api/jobs/${jobId}/validate`, { confirmedMappings });
  return res.data;
}
