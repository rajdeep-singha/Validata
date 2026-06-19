import fs from 'fs';
import path from 'path';
import { pool } from './client';
import { logger } from '../utils/logger';

export async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    logger.info(`Running migration: ${file}`);
    await pool.query(sql);
    logger.info(`Migration completed: ${file}`);
  }

  logger.info('All migrations completed.');
}
