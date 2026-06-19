import { Router } from 'express';
import { columnMapping, fixSuggestions, validationSummary, previewHeaders } from '../controllers/ai.controller';
import { aiRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();
router.get('/preview-headers/:jobId', previewHeaders);
router.post('/column-mapping', aiRateLimit, columnMapping);
router.post('/fix-suggestions', aiRateLimit, fixSuggestions);
router.get('/summary/:jobId', aiRateLimit, validationSummary);
export default router;
