import { z } from 'zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const ALLOWED_DATE_FORMATS = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM-DD-YYYY'];

export const ALLOWED_PAYMENT_MODES = ['UPI', 'CARD', 'NETBANKING', 'PAYPAL', 'CASH'] as const;

export const dateString = z.string().refine(
  (val) => ALLOWED_DATE_FORMATS.some(fmt => dayjs(val, fmt, true).isValid()),
  { message: `Date must match one of: ${ALLOWED_DATE_FORMATS.join(', ')}` }
);

export const transactionRowSchema = z.object({
  order_id:              z.string().min(1, 'Order ID is required'),
  order_date:            dateString,
  customer_name:         z.string().min(1, 'Customer name is required'),
  customer_phone:        z.string().min(1, 'Phone is required'),
  customer_country_code: z.string().min(1, 'Country code is required'),
  product_id:            z.string().min(1, 'Product ID is required'),
  product_name:          z.string().min(1, 'Product name is required'),
  quantity:              z.coerce.number({
    invalid_type_error: 'Quantity must be a number',
  }).int('Quantity must be an integer').positive('Quantity must be positive'),
  unit_price:            z.coerce.number({
    invalid_type_error: 'Unit price must be a number',
  }).nonnegative('Unit price cannot be negative'),
  total_amount:          z.coerce.number({
    invalid_type_error: 'Total amount must be a number',
  }).nonnegative('Total amount cannot be negative'),
  payment_mode:          z.enum(ALLOWED_PAYMENT_MODES, {
    errorMap: () => ({ message: `Payment mode must be one of: ${ALLOWED_PAYMENT_MODES.join(', ')}` }),
  }),
  transaction_id:        z.string().min(1, 'Transaction ID is required'),
});

export type TransactionRow = z.infer<typeof transactionRowSchema>;
