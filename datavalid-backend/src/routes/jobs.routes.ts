import { Router } from 'express';
import { getJobStatus, getJobResults } from '../controllers/jobs.controller';
import { startValidation } from '../controllers/validation.controller';

const router = Router();
router.get('/:jobId/status', getJobStatus);
router.get('/:jobId/results', getJobResults);
router.post('/:jobId/validate', startValidation);
export default router;
