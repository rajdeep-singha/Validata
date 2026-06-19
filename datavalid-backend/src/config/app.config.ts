import dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  outputDir: process.env.OUTPUT_DIR || './outputs',
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '524288000', 10),
};
