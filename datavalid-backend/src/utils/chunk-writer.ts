import fs from 'fs';
import path from 'path';
import { Writable, WritableOptions } from 'stream';
import { ValidatedRow } from '../types/domain';

const CSV_HEADER = 'order_id,order_date,customer_name,customer_phone,customer_country_code,' +
  'product_id,product_name,quantity,unit_price,total_amount,payment_mode,transaction_id,' +
  'validation_status,error_messages\n';

function escapeCsvField(val: unknown): string {
  const str = val == null ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsvLine(row: ValidatedRow): string {
  const fields = [
    row.rowData.order_id,
    row.rowData.order_date,
    row.rowData.customer_name,
    row.rowData.customer_phone,
    row.rowData.customer_country_code,
    row.rowData.product_id,
    row.rowData.product_name,
    row.rowData.quantity,
    row.rowData.unit_price,
    row.rowData.total_amount,
    row.rowData.payment_mode,
    row.rowData.transaction_id,
    row.status,
    row.errors.map(e => `${e.field}: ${e.message}`).join('; '),
  ];
  return fields.map(escapeCsvField).join(',');
}

// Writable (not Transform) — final sink in the pipeline, nothing downstream needs its output.
// Using Transform caused pipeline() to hang waiting for the readable side to be consumed.
export class ChunkedOutputWriter extends Writable {
  private chunkIndex = 0;
  private rowsInChunk = 0;
  private chunkPaths: string[] = [];
  private currentWriteStream: fs.WriteStream | null = null;

  constructor(
    private jobId: string,
    private outputDir: string,
    private chunkSize: number,
    opts?: WritableOptions
  ) {
    super({ ...opts, objectMode: true });
    this.openNewChunk();
  }

  private openNewChunk(): void {
    if (this.currentWriteStream) {
      this.currentWriteStream.end();
    }
    const chunkPath = path.join(this.outputDir, `${this.jobId}_part_${this.chunkIndex + 1}.csv`);
    this.chunkPaths.push(chunkPath);
    this.currentWriteStream = fs.createWriteStream(chunkPath, { encoding: 'utf8' });
    this.currentWriteStream.write(CSV_HEADER);
    this.chunkIndex++;
    this.rowsInChunk = 0;
  }

  _write(row: ValidatedRow, _encoding: BufferEncoding, callback: (err?: Error | null) => void): void {
    if (this.rowsInChunk >= this.chunkSize) {
      this.openNewChunk();
    }
    const ok = this.currentWriteStream!.write(rowToCsvLine(row) + '\n');
    this.rowsInChunk++;
    // Respect backpressure from the underlying file write stream
    if (ok) {
      callback();
    } else {
      this.currentWriteStream!.once('drain', () => callback());
    }
  }

  _final(callback: (err?: Error | null) => void): void {
    if (this.currentWriteStream) {
      this.currentWriteStream.end(() => callback());
    } else {
      callback();
    }
  }

  getChunkPaths(): string[] {
    return this.chunkPaths;
  }
}
