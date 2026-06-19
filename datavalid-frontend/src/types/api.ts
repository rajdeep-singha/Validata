import { type ColumnMappingEntry, type JobProgress, type JobResultRow, type JobStatus, type SchemaField } from './domain';

export interface UploadResponse {
  jobId: string;
  filename: string;
  message: string;
  status: JobStatus;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: JobProgress;
  errorMessage: string | null;
}

export interface JobResultsResponse {
  jobId: string;
  summary: { totalRows: number; validRows: number; invalidRows: number };
  rows: JobResultRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AIMappingResponse {
  mappings: ColumnMappingEntry[];
  unmappedHeaders: string[];
  unmappedSchemaFields: SchemaField[];
}

export interface FixEntry {
  field: string;
  originalValue: string;
  suggestedValue: string;
  reason: string;
  confidence: number;
}

export interface RowFixSuggestions {
  rowNumber: number;
  fixes: FixEntry[];
}

export interface FixSuggestionsResponse {
  suggestions: RowFixSuggestions[];
}

export interface AISummaryTopIssue {
  errorCode: string;
  count: number;
  percentage: number;
  description: string;
}

export interface AISummaryRecommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

export interface AISummaryResponse {
  jobId: string;
  summaryText: string;
  topIssues: AISummaryTopIssue[];
  recommendations: AISummaryRecommendation[];
  generatedAt: string;
}

export interface PreviewHeadersResponse {
  jobId: string;
  headers: string[];
  sample: Record<string, string>[];
}
