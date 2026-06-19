import { pool } from '../client';
import { JobRow, ValidatedRow } from '../../types/domain';

export async function batchInsertRows(rows: ValidatedRow[], jobId: string): Promise<void> {
  if (rows.length === 0) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];

  rows.forEach((row, i) => {
    const base = i * 5;
    placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
    values.push(
      jobId,
      row.rowNumber,
      JSON.stringify(row.rowData),
      row.status,
      row.errors.length > 0 ? JSON.stringify(row.errors) : null
    );
  });

  await pool.query(
    `INSERT INTO job_rows (job_id, row_number, row_data, status, errors) VALUES ${placeholders.join(',')}`,
    values
  );
}

export async function getJobRowsPaginated(
  jobId: string,
  page: number,
  limit: number,
  filter?: 'VALID' | 'INVALID'
): Promise<{ rows: JobRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const filterClause = filter ? `AND status = '${filter}'` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM job_rows WHERE job_id = $1 ${filterClause}`,
    [jobId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const rowsResult = await pool.query(
    `SELECT * FROM job_rows WHERE job_id = $1 ${filterClause} ORDER BY row_number LIMIT $2 OFFSET $3`,
    [jobId, limit, offset]
  );

  const rows: JobRow[] = rowsResult.rows.map(r => ({
    id: r.id,
    jobId: r.job_id,
    rowNumber: r.row_number,
    rowData: r.row_data,
    status: r.status,
    errors: r.errors,
    fixSuggestions: r.fix_suggestions,
  }));

  return { rows, total };
}

export async function getErrorBreakdown(jobId: string): Promise<Array<{ errorCode: string; count: number }>> {
  const result = await pool.query(
    `SELECT error_item->>'code' AS error_code, COUNT(*) AS count
     FROM job_rows, jsonb_array_elements(errors) AS error_item
     WHERE job_id = $1 AND status = 'INVALID'
     GROUP BY error_item->>'code'
     ORDER BY count DESC`,
    [jobId]
  );
  return result.rows.map(r => ({ errorCode: r.error_code, count: parseInt(r.count, 10) }));
}
