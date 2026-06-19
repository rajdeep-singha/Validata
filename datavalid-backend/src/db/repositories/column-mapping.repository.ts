import { pool } from '../client';
import { ColumnMapping, SchemaField } from '../../types/domain';

function rowToMapping(row: Record<string, unknown>): ColumnMapping {
  return {
    id: row.id as string,
    jobId: row.job_id as string,
    uploadedHeader: row.uploaded_header as string,
    mappedField: row.mapped_field as SchemaField,
    confidence: Number(row.confidence),
    confirmedByUser: Boolean(row.confirmed_by_user),
  };
}

export async function saveMappings(
  jobId: string,
  mappings: Array<{ uploadedHeader: string; mappedField: string; confidence?: number }>
): Promise<ColumnMapping[]> {
  // Delete existing mappings for this job first
  await pool.query('DELETE FROM column_mappings WHERE job_id = $1', [jobId]);

  const results: ColumnMapping[] = [];
  for (const m of mappings) {
    const result = await pool.query(
      `INSERT INTO column_mappings (job_id, uploaded_header, mapped_field, confidence)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [jobId, m.uploadedHeader, m.mappedField, m.confidence ?? null]
    );
    results.push(rowToMapping(result.rows[0]));
  }
  return results;
}

export async function confirmMappings(jobId: string): Promise<void> {
  await pool.query(
    'UPDATE column_mappings SET confirmed_by_user = TRUE WHERE job_id = $1',
    [jobId]
  );
}

export async function getMappingsForJob(jobId: string): Promise<ColumnMapping[]> {
  const result = await pool.query(
    'SELECT * FROM column_mappings WHERE job_id = $1 ORDER BY created_at',
    [jobId]
  );
  return result.rows.map(rowToMapping);
}
