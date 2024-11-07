import { apiImplementation, eventBusImplementation, serviceFunctionImplementation } from './implementations';
import { DevServerConfig } from './types';

export * from './implementations';

export const startDevServer = async (devServerConfig: DevServerConfig) => {
  console.log('Starting QPQ Dev Server!!!');

  await Promise.all([
    //
    apiImplementation(devServerConfig),

    //
    serviceFunctionImplementation(devServerConfig),

    //
    eventBusImplementation(devServerConfig),
  ]);
};
