import rateLimit from 'express-rate-limit';
import { AI_RATE_LIMIT_WINDOW_MS, AI_RATE_LIMIT_MAX } from '../config/ai.config';

export const aiRateLimit = rateLimit({
  windowMs: AI_RATE_LIMIT_WINDOW_MS,
  max: AI_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: `Too many AI requests. Max ${AI_RATE_LIMIT_MAX} per minute.`,
  },
});
