import { JobStatus, ValidationError, FixSuggestion, SchemaField } from './domain';

export interface UploadResponse {
  jobId: string;
  filename: string;
  message: string;
  status: JobStatus;
}

export interface JobProgress {
  processedRows: number;
  totalRows: number | null;
  validRows: number;
  invalidRows: number;
  percentage: number;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: JobProgress;
  errorMessage: string | null;
}

export interface JobResultRow {
  rowNumber: number;
  status: 'VALID' | 'INVALID';
  rowData: Record<string, string>;
  errors: ValidationError[] | null;
  fixSuggestions: FixSuggestion[] | null;
}

export interface JobResultsResponse {
  jobId: string;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
  rows: JobResultRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AIMappingEntry {
  uploadedHeader: string;
  mappedField: SchemaField;
  confidence: number;
}

export interface AIMappingResponse {
  mappings: AIMappingEntry[];
  unmappedHeaders: string[];
  unmappedSchemaFields: SchemaField[];
}

export interface FixSuggestionEntry {
  field: string;
  originalValue: string;
  suggestedValue: string;
  reason: string;
  confidence: number;
}

export interface RowFixSuggestions {
  rowNumber: number;
  fixes: FixSuggestionEntry[];
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

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
