import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { DevServerConfig } from '../types';

export const webSocketImplementation = async (devServerConfig: DevServerConfig) => {
  if (!devServerConfig.webSocketPort) {
    return;
  }

  console.log('Starting WebSocket Server!');

  const server = createServer();
  const wss1 = new WebSocketServer({ noServer: true });
  const wss2 = new WebSocketServer({ noServer: true });

  wss1.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (data) => {
      console.log('received: %s', data);
    });

    ws.on('close', () => {
      console.log('disconnected');
    });

    // ...
  });

  wss2.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (data) => {
      console.log('received: %s', data);
    });

    ws.on('close', () => {
      console.log('disconnected');
    });

    // ...
  });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', 'wss://base.url');

    if (pathname === '/foo') {
      wss1.handleUpgrade(request, socket, head, (ws) => {
        wss1.emit('connection', ws, request);
      });
    } else if (pathname === '/bar') {
      wss2.handleUpgrade(request, socket, head, (ws) => {
        wss2.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(devServerConfig.webSocketPort, 'localhost');

  // Never ends
  await new Promise(() => {});
};
