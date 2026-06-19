import { pool } from '../client';
import { Job, JobStatus } from '../../types/domain';

function rowToJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    originalFilename: row.original_filename as string,
    filePath: row.file_path as string,
    fileSizeBytes: Number(row.file_size_bytes),
    status: row.status as JobStatus,
    totalRows: row.total_rows as number | null,
    processedRows: Number(row.processed_rows),
    validRows: Number(row.valid_rows),
    invalidRows: Number(row.invalid_rows),
    outputPaths: (row.output_paths as string[]) || [],
    errorMessage: row.error_message as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export async function createJob(data: {
  originalFilename: string;
  filePath: string;
  fileSizeBytes: number;
}): Promise<Job> {
  const result = await pool.query(
    `INSERT INTO jobs (original_filename, file_path, file_size_bytes, status)
     VALUES ($1, $2, $3, 'PENDING')
     RETURNING *`,
    [data.originalFilename, data.filePath, data.fileSizeBytes]
  );
  return rowToJob(result.rows[0]);
}

export async function getJobById(id: string): Promise<Job | null> {
  const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToJob(result.rows[0]);
}

export async function updateJobStatus(id: string, status: JobStatus, errorMessage?: string): Promise<void> {
  await pool.query(
    `UPDATE jobs SET status = $1, error_message = $2, updated_at = now() WHERE id = $3`,
    [status, errorMessage ?? null, id]
  );
}

export async function updateJobProgress(id: string, data: {
  processedRows: number;
  validRows: number;
  invalidRows: number;
}): Promise<void> {
  await pool.query(
    `UPDATE jobs SET processed_rows = $1, valid_rows = $2, invalid_rows = $3, updated_at = now() WHERE id = $4`,
    [data.processedRows, data.validRows, data.invalidRows, id]
  );
}

export async function setJobTotalRows(id: string, totalRows: number): Promise<void> {
  await pool.query('UPDATE jobs SET total_rows = $1, updated_at = now() WHERE id = $2', [totalRows, id]);
}

export async function completeJob(id: string, outputPaths: string[]): Promise<void> {
  await pool.query(
    `UPDATE jobs SET status = 'COMPLETED', output_paths = $1, updated_at = now() WHERE id = $2`,
    [outputPaths, id]
  );
}

export async function setJobMapping(id: string): Promise<void> {
  await pool.query(
    `UPDATE jobs SET status = 'MAPPING', updated_at = now() WHERE id = $1`,
    [id]
  );
}
