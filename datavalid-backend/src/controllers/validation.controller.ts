import { Request, Response } from 'express';
import { getJobById, updateJobStatus } from '../db/repositories/job.repository';
import { saveMappings, confirmMappings } from '../db/repositories/column-mapping.repository';
import { getValidationQueue } from '../queues/validation.queue';
import { logger } from '../utils/logger';

export async function startValidation(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  const { confirmedMappings } = req.body as {
    confirmedMappings: Array<{ uploadedHeader: string; mappedField: string }>;
  };

  if (!confirmedMappings || confirmedMappings.length === 0) {
    res.status(400).json({ error: 'MISSING_MAPPINGS', message: 'confirmedMappings is required' });
    return;
  }

  try {
    const job = await getJobById(jobId);
    if (!job) {
      res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
      return;
    }

    if (job.status !== 'MAPPING') {
      res.status(409).json({
        error: 'INVALID_STATE',
        message: `Job is in ${job.status} state, expected MAPPING`,
      });
      return;
    }

    // Save confirmed mappings
    await saveMappings(jobId, confirmedMappings.map(m => ({
      uploadedHeader: m.uploadedHeader,
      mappedField: m.mappedField,
    })));
    await confirmMappings(jobId);

    // Build header map for the pipeline
    const headerMap: Record<string, string> = {};
    for (const m of confirmedMappings) {
      headerMap[m.uploadedHeader] = m.mappedField;
    }

    // Update status to PROCESSING before enqueuing
    await updateJobStatus(jobId, 'PROCESSING');

    await getValidationQueue().add('validate' as string, {
      jobId,
      filePath: job.filePath,
      headerMap,
    });

    logger.info('Validation enqueued', { jobId });

    res.status(202).json({
      jobId,
      message: 'Validation job enqueued.',
      status: 'PROCESSING',
    });
  } catch (err) {
    logger.error('Failed to start validation', { jobId, error: (err as Error).message });
    res.status(500).json({ error: 'ENQUEUE_FAILED', message: 'Failed to enqueue validation job' });
  }
}
