import { ValidationConfig } from '../types/config';

export const validationConfig: ValidationConfig = {
  phone: {
    IN: { length: 10, regex: '^[6-9]\\d{9}$' },
    SG: { length: 8,  regex: '^[689]\\d{7}$' },
    US: { length: 10, regex: '^[2-9]\\d{9}$' },
    GB: { length: 11, regex: '^07\\d{9}$' },
    AU: { length: 10, regex: '^04\\d{8}$' },
  },
  dateFormats: {
    allowedFormats: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM-DD-YYYY'],
    strict: true,
  },
  allowedPaymentModes: ['UPI', 'CARD', 'NETBANKING', 'PAYPAL', 'CASH'],
  chunkSize: parseInt(process.env.CHUNK_SIZE || '10000', 10),
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '524288000', 10),
  batchInsertSize: parseInt(process.env.BATCH_INSERT_SIZE || '500', 10),
};
