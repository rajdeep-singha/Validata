import fs from 'fs';
import path from 'path';
import { appConfig } from '../config/app.config';

export function ensureOutputDir(): void {
  if (!fs.existsSync(appConfig.outputDir)) {
    fs.mkdirSync(appConfig.outputDir, { recursive: true });
  }
}

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch { /* best-effort cleanup */ }
}

export function getAbsoluteOutputPath(filename: string): string {
  return path.resolve(appConfig.outputDir, filename);
}

export function getAbsoluteUploadPath(filename: string): string {
  return path.resolve(appConfig.uploadDir, filename);
}
