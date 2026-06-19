import { Request, Response } from 'express';
import { getJobById } from '../db/repositories/job.repository';
import { getJobRowsPaginated } from '../db/repositories/job-row.repository';
import { paginationSchema } from '../schemas/api.schema';

export async function getJobStatus(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;

  const job = await getJobById(jobId);
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
    return;
  }

  const totalRows = job.totalRows ?? 0;
  const percentage = totalRows > 0
    ? Math.min(100, Math.round((job.processedRows / totalRows) * 100))
    : (job.status === 'COMPLETED' ? 100 : 0);

  res.json({
    jobId: job.id,
    status: job.status,
    progress: {
      processedRows: job.processedRows,
      totalRows: job.totalRows,
      validRows: job.validRows,
      invalidRows: job.invalidRows,
      percentage,
    },
    errorMessage: job.errorMessage,
  });
}

export async function getJobResults(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;

  const queryResult = paginationSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ error: 'INVALID_QUERY', details: queryResult.error.errors });
    return;
  }

  const { page, limit, filter } = queryResult.data;

  const job = await getJobById(jobId);
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
    return;
  }

  const { rows, total } = await getJobRowsPaginated(jobId, page, limit, filter);

  res.json({
    jobId,
    summary: {
      totalRows: job.totalRows ?? 0,
      validRows: job.validRows,
      invalidRows: job.invalidRows,
    },
    rows: rows.map(r => ({
      rowNumber: r.rowNumber,
      status: r.status,
      rowData: r.rowData,
      errors: r.errors,
      fixSuggestions: r.fixSuggestions,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
