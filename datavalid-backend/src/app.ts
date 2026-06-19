import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { appConfig } from './config/app.config';
import apiRoutes from './routes/index';
import { errorMiddleware } from './middleware/error.middleware';

export function createApp(): express.Application {
  const app = express();

  app.use(cors({
    origin: appConfig.corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', apiRoutes);

  // Global error handler (must be last)
  app.use(errorMiddleware);

  return app;
}
