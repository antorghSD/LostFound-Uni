import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './infrastructure/database/prisma.js';
import { errorHandler } from './interface/http/middlewares/errorHandler.js';
import { notFound } from './interface/http/middlewares/notFound.js';
import routes from './interface/http/routes/index.js';

const app = express();

// ---------- Security ----------
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// ---------- Parsers ----------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- Health ----------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- API ----------
app.use('/api/v1', routes);

// ---------- 404 + Error ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📦 Environment: ${env.NODE_ENV}`);
});

// ---------- Graceful shutdown ----------
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));