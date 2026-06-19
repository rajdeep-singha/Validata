import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../config/app.config';
import fs from 'fs';

// Ensure upload directory exists
if (!fs.existsSync(appConfig.uploadDir)) {
  fs.mkdirSync(appConfig.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, appConfig.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  const allowed = ['.csv', 'text/csv', 'application/vnd.ms-excel', 'text/plain'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are accepted'));
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: appConfig.maxFileSizeBytes },
});
