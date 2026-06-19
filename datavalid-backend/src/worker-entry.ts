/**
 * Standalone entry point for the BullMQ worker process.
 * Deployed as a separate Render Background Worker service.
 */
import dotenv from 'dotenv';
dotenv.config();

import { startValidationWorker } from './workers/validation.worker';
import { logger } from './utils/logger';

logger.info('Starting validation worker...');
const worker = startValidationWorker();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — gracefully closing worker');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received — gracefully closing worker');
  await worker.close();
  process.exit(0);
});
