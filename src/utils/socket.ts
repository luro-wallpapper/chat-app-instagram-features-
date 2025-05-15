import { io } from 'socket.io-client';

const getSocketUrl = () => {
  // For production (Render deployment)
  if (window.location.hostname.includes('onrender.com')) {
    return window.location.origin;
  }
  
  // For WebContainer environment
  if (window.location.hostname.includes('webcontainer')) {
    const port = '3001';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${window.location.hostname}:${port}`;
  }
  
  // For local development
  return 'ws://localhost:3001';
};

export const socket = io(getSocketUrl(), {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 60000, // Increased timeout to 60 seconds
  withCredentials: false,
  path: '/socket.io/',
  forceNew: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000
});

socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  // Attempt to reconnect with a delay
  setTimeout(() => {
    socket.connect();
  }, 5000);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server initiated disconnect, try to reconnect
    setTimeout(() => {
      socket.connect();
    }, 5000);
  }
});

// Add error handler
socket.on('error', (error) => {
  console.error('Socket error:', error);
});