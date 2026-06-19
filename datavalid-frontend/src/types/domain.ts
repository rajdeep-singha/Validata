export type JobStatus = 'PENDING' | 'MAPPING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PaymentMode = 'UPI' | 'CARD' | 'NETBANKING' | 'PAYPAL' | 'CASH';

export type SchemaField =
  | 'order_id' | 'order_date' | 'customer_name' | 'customer_phone'
  | 'customer_country_code' | 'product_id' | 'product_name' | 'quantity'
  | 'unit_price' | 'total_amount' | 'payment_mode' | 'transaction_id';

export const ALL_SCHEMA_FIELDS: SchemaField[] = [
  'order_id', 'order_date', 'customer_name', 'customer_phone',
  'customer_country_code', 'product_id', 'product_name', 'quantity',
  'unit_price', 'total_amount', 'payment_mode', 'transaction_id',
];

export interface ValidationError {
  field: string;
  code: string;
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

export interface JobProgress {
  processedRows: number;
  totalRows: number | null;
  validRows: number;
  invalidRows: number;
  percentage: number;
}

export interface ColumnMappingEntry {
  uploadedHeader: string;
  mappedField: SchemaField;
  confidence: number;
}

export interface JobResultRow {
  rowNumber: number;
  status: 'VALID' | 'INVALID';
  rowData: Record<string, string>;
  errors: ValidationError[] | null;
  fixSuggestions: FixSuggestion[] | null;
}
