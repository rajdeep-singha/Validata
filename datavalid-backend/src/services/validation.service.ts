import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Transform, TransformCallback } from 'stream';
import csvParser from 'csv-parser';
import { validationConfig } from '../config/validation.config';
import { validateRow } from './row-validator.service';
import { getOrderIdSet, clearOrderIdSet } from './dedup.service';
import { ChunkedOutputWriter } from '../utils/chunk-writer';
import { countCsvRows } from '../utils/stream-counter';
import { batchInsertRows } from '../db/repositories/job-row.repository';
import {
  updateJobStatus,
  updateJobProgress,
  setJobTotalRows,
  completeJob,
} from '../db/repositories/job.repository';
import { appConfig } from '../config/app.config';
import { ensureOutputDir } from './file.service';
import { logger } from '../utils/logger';
import { ValidatedRow } from '../types/domain';

class FieldRenameTransform extends Transform {
  constructor(private headerMap: Record<string, string>) {
    super({ objectMode: true });
  }
  _transform(row: Record<string, string>, _: BufferEncoding, callback: TransformCallback): void {
    const renamed: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      renamed[this.headerMap[key] ?? key] = value?.trim() ?? '';
    }
    this.push(renamed);
    callback();
  }
}

class RowValidationTransform extends Transform {
  private rowNumber = 0;
  private processedRows = 0;
  private validRows = 0;
  private invalidRows = 0;
  private batch: ValidatedRow[] = [];
  private seenOrderIds: Set<string>;

  constructor(
    private jobId: string,
    private batchSize: number,
    private onBatch: (
      batch: ValidatedRow[],
      stats: { processedRows: number; validRows: number; invalidRows: number }
    ) => Promise<void>
  ) {
    super({ objectMode: true });
    this.seenOrderIds = getOrderIdSet(jobId);
  }

  private async flushBatch(): Promise<void> {
    if (this.batch.length === 0) return;
    const toFlush = this.batch.splice(0);
    await this.onBatch(toFlush, {
      processedRows: this.processedRows,
      validRows: this.validRows,
      invalidRows: this.invalidRows,
    });
  }

  _transform(row: Record<string, string>, _: BufferEncoding, callback: TransformCallback): void {
    this.rowNumber++;
    const validated = validateRow(row, this.rowNumber, this.seenOrderIds);
    this.batch.push(validated);
    this.processedRows++;
    if (validated.status === 'VALID') this.validRows++;
    else this.invalidRows++;

    // Push downstream immediately (for ChunkedOutputWriter)
    this.push(validated);

    if (this.batch.length >= this.batchSize) {
      this.flushBatch()
        .then(() => callback())
        .catch(callback);
    } else {
      callback();
    }
  }

  _flush(callback: TransformCallback): void {
    this.flushBatch()
      .then(() => callback())
      .catch(callback);
  }
}

export async function runValidationPipeline(
  jobId: string,
  filePath: string,
  headerMap: Record<string, string>
): Promise<void> {
  ensureOutputDir();

  try {
    await updateJobStatus(jobId, 'PROCESSING');

    const totalRows = await countCsvRows(filePath);
    await setJobTotalRows(jobId, totalRows);
    logger.info('Validation pipeline started', { jobId, totalRows });

    const chunkWriter = new ChunkedOutputWriter(
      jobId,
      path.resolve(appConfig.outputDir),
      validationConfig.chunkSize
    );

    // Use pipeline() — it properly propagates errors across all streams
    await pipeline(
      fs.createReadStream(filePath),
      csvParser(),
      new FieldRenameTransform(headerMap),
      new RowValidationTransform(
        jobId,
        validationConfig.batchInsertSize,
        async (batch, stats) => {
          await batchInsertRows(batch, jobId);
          await updateJobProgress(jobId, stats);
        }
      ),
      chunkWriter
    );

    const outputPaths = chunkWriter.getChunkPaths();
    await completeJob(jobId, outputPaths);
    clearOrderIdSet(jobId);
    logger.info('Validation pipeline completed', { jobId, chunks: outputPaths.length });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Validation pipeline failed', { jobId, message });
    await updateJobStatus(jobId, 'FAILED', message);
    clearOrderIdSet(jobId);
    throw err;
  }
}
