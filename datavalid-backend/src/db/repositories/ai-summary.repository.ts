import { pool } from '../client';
import { AISummary } from '../../types/domain';

function rowToSummary(row: Record<string, unknown>): AISummary {
  return {
    id: row.id as string,
    jobId: row.job_id as string,
    summaryText: row.summary_text as string,
    topIssues: row.top_issues as AISummary['topIssues'],
    recommendations: row.recommendations as AISummary['recommendations'],
    generatedAt: new Date(row.generated_at as string),
  };
}

export async function getSummaryByJobId(jobId: string): Promise<AISummary | null> {
  const result = await pool.query('SELECT * FROM ai_summaries WHERE job_id = $1', [jobId]);
  if (result.rows.length === 0) return null;
  return rowToSummary(result.rows[0]);
}

export async function saveSummary(
  jobId: string,
  data: { summaryText: string; topIssues: unknown; recommendations: unknown }
): Promise<AISummary> {
  const result = await pool.query(
    `INSERT INTO ai_summaries (job_id, summary_text, top_issues, recommendations)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (job_id) DO UPDATE
       SET summary_text = EXCLUDED.summary_text,
           top_issues = EXCLUDED.top_issues,
           recommendations = EXCLUDED.recommendations,
           generated_at = now()
     RETURNING *`,
    [jobId, data.summaryText, JSON.stringify(data.topIssues), JSON.stringify(data.recommendations)]
  );
  return rowToSummary(result.rows[0]);
}
