import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.config';
import { runValidationPipeline } from '../services/validation.service';
import { ValidationJobData } from '../queues/validation.queue';
import { logger } from '../utils/logger';

const CONCURRENCY = parseInt(process.env.BULLMQ_CONCURRENCY || '3', 10);

export function startValidationWorker(): Worker {
  const worker = new Worker<ValidationJobData>(
    'validation',
    async (job) => {
      const { jobId, filePath, headerMap } = job.data;
      logger.info('Processing validation job', { jobId, bullJobId: job.id });
      await runValidationPipeline(jobId, filePath, headerMap);
    },
    {
      connection: redisConnection,
      concurrency: CONCURRENCY,
    }
  );

  worker.on('completed', (job) => {
    logger.info('Validation job completed', { jobId: job.data.jobId, bullJobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Validation job failed', {
      jobId: job?.data?.jobId,
      bullJobId: job?.id,
      error: err.message,
    });
  });

  return worker;
}
