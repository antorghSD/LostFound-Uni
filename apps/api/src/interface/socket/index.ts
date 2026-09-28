import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt.js';
import { logger } from '../../config/logger.js';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, { cors: { origin: '*' } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    logger.info({ userId }, 'socket connected');

    socket.on('disconnect', () => logger.info({ userId }, 'socket disconnected'));
  });

  return io;
};

export const emitToUser = (userId: string, event: string, data: unknown) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};