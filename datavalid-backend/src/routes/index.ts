import { Router, Request, Response } from 'express';
import uploadRoutes from './upload.routes';
import jobsRoutes from './jobs.routes';
import aiRoutes from './ai.routes';
import downloadRoutes from './download.routes';

const router = Router();

router.use('/upload', uploadRoutes);
router.use('/jobs', jobsRoutes);
router.use('/ai', aiRoutes);
router.use('/download', downloadRoutes);

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
