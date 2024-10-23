import { createContext } from 'react';
import { WebsocketService } from 'quidproquo-web';

export const WebSocketContext = createContext<WebsocketService | null>(null);
