import fs from 'fs';
import readline from 'readline';

/**
 * Counts data rows in a CSV file (total lines minus 1 for the header).
 * Stream-based — never loads the whole file into memory.
 */
export function countCsvRows(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let lineCount = 0;
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    rl.on('line', () => { lineCount++; });
    rl.on('close', () => resolve(Math.max(0, lineCount - 1))); // subtract header
    rl.on('error', reject);
    stream.on('error', reject);
  });
}
