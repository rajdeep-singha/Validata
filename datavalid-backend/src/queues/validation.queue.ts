import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.config';

export interface ValidationJobData {
  jobId: string;
  filePath: string;
  headerMap: Record<string, string>;
}

const queueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 } as const,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
};

// Lazy singleton — Queue (and its Redis connection) is created only when first used,
// not at module import time. This prevents startup crashes when Redis is unavailable.
let _queue: Queue<ValidationJobData> | null = null;

export function getValidationQueue(): Queue<ValidationJobData> {
  if (!_queue) {
    _queue = new Queue<ValidationJobData>('validation', queueOptions);
  }
  return _queue;
}
