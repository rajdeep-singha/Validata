import { Request, Response } from 'express';
import { createJob, setJobMapping } from '../db/repositories/job.repository';
import { logger } from '../utils/logger';

export async function uploadFile(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'NO_FILE', message: 'No file uploaded' });
    return;
  }

  try {
    const job = await createJob({
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      fileSizeBytes: req.file.size,
    });

    // Move job to MAPPING status so client knows to call AI column mapping next
    await setJobMapping(job.id);

    logger.info('File uploaded', { jobId: job.id, filename: req.file.originalname });

    res.status(202).json({
      jobId: job.id,
      filename: req.file.originalname,
      message: 'File uploaded. Proceed to AI column mapping.',
      status: 'MAPPING',
    });
  } catch (err) {
    logger.error('Upload failed', { error: (err as Error).message });
    res.status(500).json({ error: 'UPLOAD_FAILED', message: 'Failed to process upload' });
  }
}
