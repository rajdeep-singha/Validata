export type JobStatus = 'PENDING' | 'MAPPING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type PaymentMode = 'UPI' | 'CARD' | 'NETBANKING' | 'PAYPAL' | 'CASH';

export type SchemaField =
  | 'order_id'
  | 'order_date'
  | 'customer_name'
  | 'customer_phone'
  | 'customer_country_code'
  | 'product_id'
  | 'product_name'
  | 'quantity'
  | 'unit_price'
  | 'total_amount'
  | 'payment_mode'
  | 'transaction_id';

export const ALL_SCHEMA_FIELDS: SchemaField[] = [
  'order_id', 'order_date', 'customer_name', 'customer_phone',
  'customer_country_code', 'product_id', 'product_name', 'quantity',
  'unit_price', 'total_amount', 'payment_mode', 'transaction_id',
];

export type ErrorCode =
  | 'MISSING_REQUIRED'
  | 'EMPTY_VALUE'
  | 'INVALID_PHONE'
  | 'INVALID_DATE_FORMAT'
  | 'INVALID_PAYMENT_MODE'
  | 'NEGATIVE_AMOUNT'
  | 'INVALID_QUANTITY'
  | 'DUPLICATE_ORDER_ID'
  | 'INVALID_NUMBER';

export interface ValidationError {
  field: string;
  code: ErrorCode;
  message: string;
  value?: unknown;
}

export interface FixSuggestion {
  field: string;
  originalValue: string;
  suggestedValue: string;
  reason: string;
  confidence: number;
  approved: boolean | null;
}

export interface Job {
  id: string;
  originalFilename: string;
  filePath: string;
  fileSizeBytes: number;
  status: JobStatus;
  totalRows: number | null;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  outputPaths: string[];
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnMapping {
  id: string;
  jobId: string;
  uploadedHeader: string;
  mappedField: SchemaField;
  confidence: number;
  confirmedByUser: boolean;
}

export interface JobRow {
  id: number;
  jobId: string;
  rowNumber: number;
  rowData: Record<string, string>;
  status: 'VALID' | 'INVALID';
  errors: ValidationError[] | null;
  fixSuggestions: FixSuggestion[] | null;
}

export interface AISummary {
  id: string;
  jobId: string;
  summaryText: string;
  topIssues: Array<{
    errorCode: ErrorCode;
    count: number;
    percentage: number;
    description: string;
  }>;
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
  }>;
  generatedAt: Date;
}

export interface ValidatedRow {
  rowNumber: number;
  rowData: Record<string, string>;
  status: 'VALID' | 'INVALID';
  errors: ValidationError[];
}
