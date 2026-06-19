import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { uploadFile } from '../controllers/upload.controller';

const router = Router();
router.post('/', uploadMiddleware.single('file'), uploadFile);
export default router;
