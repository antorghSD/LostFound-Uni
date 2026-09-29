import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('accessToken');
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[socket] connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('[socket] disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('[socket] connect error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;