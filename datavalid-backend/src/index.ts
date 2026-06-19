import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { appConfig } from './config/app.config';
import { runMigrations } from './db/migrate';
import { logger } from './utils/logger';


// The API still works; only job enqueuing will fail if Redis is unavailable.
process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  if (msg.includes('ECONNREFUSED') && msg.includes('6379')) {
    logger.warn('Redis unavailable — job queue disabled until Redis is reachable');
  } else {
    logger.error('Unhandled rejection', { reason: msg });
  }
});

async function main(): Promise<void> {
  // Run DB migrations on startup
  try {
    await runMigrations();
  } catch (err) {
    logger.error('Migration failed — exiting', { error: (err as Error).message });
    process.exit(1);
  }

  // Start BullMQ worker in the same process so it shares the filesystem with the API
  const { startValidationWorker } = await import('./workers/validation.worker');
  startValidationWorker();
  logger.info('Validation worker started in-process');

  const app = createApp();

  const server = app.listen(appConfig.port, () => {
    logger.info(`DataValid API started`, {
      port: appConfig.port,
      env: appConfig.nodeEnv,
    });
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received — shutting down gracefully');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
}

main().catch((err) => {
  logger.error('Fatal startup error', { error: (err as Error).message });
  process.exit(1);
});
