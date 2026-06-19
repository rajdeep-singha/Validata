import { PaymentMode } from './domain';

export interface PhoneValidationRule {
  length: number;
  regex: string;
}

export interface PhoneValidationConfig {
  [countryCode: string]: PhoneValidationRule;
}

export interface DateFormatConfig {
  allowedFormats: string[];
  strict: boolean;
}

export interface ValidationConfig {
  phone: PhoneValidationConfig;
  dateFormats: DateFormatConfig;
  allowedPaymentModes: PaymentMode[];
  chunkSize: number;
  maxFileSizeBytes: number;
  batchInsertSize: number;
}
