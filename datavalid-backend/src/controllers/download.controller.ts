import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { getJobById } from '../db/repositories/job.repository';
import { logger } from '../utils/logger';

export async function downloadJob(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;

  const job = await getJobById(jobId);
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
    return;
  }

  if (job.status !== 'COMPLETED') {
    res.status(409).json({
      error: 'NOT_READY',
      message: `Job is in ${job.status} state. Download available only after COMPLETED.`,
    });
    return;
  }

  const outputPaths = job.outputPaths.filter(p => fs.existsSync(p));
  if (outputPaths.length === 0) {
    res.status(404).json({ error: 'NO_OUTPUT', message: 'No output files found for this job' });
    return;
  }

  if (outputPaths.length === 1) {
    // Single file — stream directly
    const filePath = outputPaths[0];
    const filename = path.basename(filePath);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Multiple files — stream as ZIP via archiver (no temp file)
  const baseName = `validated_${jobId.slice(0, 8)}`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${baseName}.zip"`);

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.on('error', (err) => {
    logger.error('Archiver error', { jobId, error: err.message });
    if (!res.headersSent) res.status(500).end();
  });

  archive.pipe(res);

  for (const filePath of outputPaths) {
    archive.file(filePath, { name: path.basename(filePath) });
  }

  await archive.finalize();
  logger.info('Download streamed', { jobId, fileCount: outputPaths.length });
}
