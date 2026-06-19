import { Request, Response } from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { getColumnMappings, getFixSuggestions, generateValidationSummary } from '../services/ai.service';
import { getSummaryByJobId, saveSummary } from '../db/repositories/ai-summary.repository';
import { getJobById } from '../db/repositories/job.repository';
import { getErrorBreakdown } from '../db/repositories/job-row.repository';
import { columnMappingRequestSchema, fixSuggestionRequestSchema } from '../schemas/api.schema';
import { logger } from '../utils/logger';

//  POST /api/ai/column-mapping 

export async function columnMapping(req: Request, res: Response): Promise<void> {
  const parseResult = columnMappingRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parseResult.error.errors });
    return;
  }

  const { jobId, headers, sample } = parseResult.data;

  const job = await getJobById(jobId);
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
    return;
  }

  try {
    const result = await getColumnMappings(headers, sample);
    res.json(result);
  } catch (err) {
    logger.error('AI column mapping failed', { jobId, error: (err as Error).message });
    res.status(500).json({ error: 'AI_ERROR', message: (err as Error).message });
  }
}

//  POST /api/ai/fix-suggestions 

export async function fixSuggestions(req: Request, res: Response): Promise<void> {
  const parseResult = fixSuggestionRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parseResult.error.errors });
    return;
  }

  const { jobId, rows } = parseResult.data;

  const job = await getJobById(jobId);
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
    return;
  }

  try {
    const result = await getFixSuggestions(rows);
    res.json(result);
  } catch (err) {
    logger.error('AI fix suggestions failed', { jobId, error: (err as Error).message });
    res.status(500).json({ error: 'AI_ERROR', message: (err as Error).message });
  }
}

//  GET /api/ai/summary/:jobId 

export async function validationSummary(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;

  const job = await getJobById(jobId);
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
    return;
  }

  if (job.status !== 'COMPLETED') {
    res.status(409).json({ error: 'NOT_READY', message: 'Job must be COMPLETED before generating summary' });
    return;
  }

  // Return cached summary if available
  const cached = await getSummaryByJobId(jobId);
  if (cached) {
    res.json({
      jobId,
      summaryText: cached.summaryText,
      topIssues: cached.topIssues,
      recommendations: cached.recommendations,
      generatedAt: cached.generatedAt.toISOString(),
    });
    return;
  }

  try {
    const errorBreakdown = await getErrorBreakdown(jobId);
    const aiResult = await generateValidationSummary({
      jobId,
      totalRows: job.totalRows ?? 0,
      validRows: job.validRows,
      invalidRows: job.invalidRows,
      errorBreakdown,
    });

    const saved = await saveSummary(jobId, aiResult);
    res.json({
      jobId,
      summaryText: saved.summaryText,
      topIssues: saved.topIssues,
      recommendations: saved.recommendations,
      generatedAt: saved.generatedAt.toISOString(),
    });
  } catch (err) {
    logger.error('AI summary generation failed', { jobId, error: (err as Error).message });
    res.status(500).json({ error: 'AI_ERROR', message: (err as Error).message });
  }
}

// ─── POST /api/ai/preview-headers ────────────────────────────────────────────
// Helper: returns headers + first 5 rows from the uploaded file for mapping

export async function previewHeaders(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;

  const job = await getJobById(jobId);
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` });
    return;
  }

  if (!fs.existsSync(job.filePath)) {
    res.status(404).json({ error: 'FILE_NOT_FOUND', message: 'Uploaded file no longer exists' });
    return;
  }

  const headers: string[] = [];
  const sample: Record<string, string>[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(job.filePath)
      .pipe(csvParser())
      .on('headers', (h: string[]) => headers.push(...h))
      .on('data', (row: Record<string, string>) => {
        if (sample.length < 5) sample.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  }).catch(() => { /* stream may end early */ });

  res.json({ jobId, headers, sample });
}
