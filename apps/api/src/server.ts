import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { startEmailWorker } from './infrastructure/queue/email.queue.js';
import { verifyEmailConnection } from './infrastructure/email/email.service.js';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './infrastructure/database/prisma.js';
import { initSocket } from './interface/socket/index.js';
import { startMatchingWorker } from './infrastructure/queue/matching.queue.js';

import { errorHandler } from './interface/http/middlewares/errorHandler.js';
import { notFound } from './interface/http/middlewares/notFound.js';
import { authLimiter, apiLimiter } from './interface/http/middlewares/rateLimit.js';
import routes from './interface/http/routes/index.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
const app = express();

// ---------- Security ----------
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));

// ---------- Parsers ----------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- Docs ----------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------- Health ----------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- Rate limits ----------
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);

// ---------- API ----------
app.use('/api/v1', routes);

// ---------- 404 + Error ----------
app.use(notFound);
app.use(errorHandler);

// ---------- HTTP server + Socket.io ----------
const httpServer = createServer(app);
initSocket(httpServer);

// ---------- Background worker ----------
startMatchingWorker();
startEmailWorker();
verifyEmailConnection();

// ---------- Start ----------
httpServer.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📦 Environment: ${env.NODE_ENV}`);
  logger.info(`📚 Docs: http://localhost:${env.PORT}/api-docs`);
});

// ---------- Graceful shutdown ----------
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down...`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));