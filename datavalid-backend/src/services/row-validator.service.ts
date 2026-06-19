import { transactionRowSchema } from '../schemas/row.schema';
import { validatePhone } from '../utils/phone-validator';
import { ValidationError, ValidatedRow, ErrorCode } from '../types/domain';

/**
 * Validates a single row (already field-renamed to canonical schema names).
 * Returns a ValidatedRow with status and any errors collected.
 */
export function validateRow(
  rawRow: Record<string, string>,
  rowNumber: number,
  seenOrderIds: Set<string>
): ValidatedRow {
  const errors: ValidationError[] = [];

  // 1. Zod schema validation (structural + type + payment mode + date)
  const parseResult = transactionRowSchema.safeParse(rawRow);

  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] as string;
      const code = mapZodCodeToErrorCode(issue.code, field);
      errors.push({ field, code, message: issue.message, value: rawRow[field] });
    }
  }

  // 2. Phone number validation (requires both phone + country code fields to be present)
  const phone = rawRow['customer_phone'];
  const countryCode = rawRow['customer_country_code'];
  if (phone && countryCode) {
    // Only run phone validation if zod didn't already flag these fields
    const phoneAlreadyFlagged = errors.some(e => e.field === 'customer_phone');
    if (!phoneAlreadyFlagged && !validatePhone(phone, countryCode)) {
      errors.push({
        field: 'customer_phone',
        code: 'INVALID_PHONE',
        message: `Phone number is invalid for country ${countryCode.toUpperCase()}`,
        value: phone,
      });
    }
  }

  // 3. Duplicate order ID detection
  const orderId = rawRow['order_id'];
  if (orderId && parseResult.success) {
    if (seenOrderIds.has(orderId)) {
      errors.push({
        field: 'order_id',
        code: 'DUPLICATE_ORDER_ID',
        message: `Duplicate order ID: ${orderId}`,
        value: orderId,
      });
    } else {
      seenOrderIds.add(orderId);
    }
  }

  return {
    rowNumber,
    rowData: rawRow,
    status: errors.length === 0 ? 'VALID' : 'INVALID',
    errors,
  };
}

function mapZodCodeToErrorCode(zodCode: string, field: string): ErrorCode {
  if (zodCode === 'too_small' && field === 'quantity') return 'INVALID_QUANTITY';
  if (zodCode === 'too_small' && (field === 'unit_price' || field === 'total_amount')) return 'NEGATIVE_AMOUNT';
  if (zodCode === 'invalid_type' && ['quantity', 'unit_price', 'total_amount'].includes(field)) return 'INVALID_NUMBER';
  if (zodCode === 'invalid_enum_value' && field === 'payment_mode') return 'INVALID_PAYMENT_MODE';
  if (field === 'order_date') return 'INVALID_DATE_FORMAT';
  if (zodCode === 'too_small') return 'EMPTY_VALUE';
  return 'MISSING_REQUIRED';
}
