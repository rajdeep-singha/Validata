import { Router } from 'express';
import { downloadJob } from '../controllers/download.controller';

const router = Router();
router.get('/:jobId', downloadJob);
export default router;
