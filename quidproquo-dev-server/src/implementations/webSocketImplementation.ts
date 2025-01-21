import { DevServerConfig } from '../types';

export const webSocketImplementation = async (devServerConfig: DevServerConfig) => {
  console.log('Starting WebSocket Server!');

  // Never ends
  await new Promise(() => {});
};
