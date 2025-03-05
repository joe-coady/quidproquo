import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import {
  apiImplementation,
  eventBusImplementation,
  queueImplementation,
  serviceFunctionImplementation,
  webSocketImplementation,
} from './implementations';
import { DevServerConfig, DevServerConfigOverrides } from './types';

export * from './implementations';

export const getDevConfigs = (qpqConfigs: QPQConfig[], devServerConfigOverrides?: DevServerConfigOverrides): QPQConfig[] => {
  return qpqConfigs.map((qpqConfig) => {
    return [
      // Base config
      ...qpqConfig,

      // all service override
      ...(devServerConfigOverrides?.allServices || []),

      // specific service override
      ...((devServerConfigOverrides?.byService || {})[qpqCoreUtils.getApplicationModuleName(qpqConfig)] || []),
    ];
  });
};

export const startDevServer = async (devServerConfig: DevServerConfig, devServerConfigOverrides?: DevServerConfigOverrides) => {
  console.log('Starting QPQ Dev Server!!!');

  // Add ovverrides for dev server
  const updatedDevServerConfig: DevServerConfig = {
    ...devServerConfig,

    qpqConfigs: getDevConfigs(devServerConfig.qpqConfigs),
  };

  await Promise.all([
    apiImplementation(updatedDevServerConfig),

    serviceFunctionImplementation(updatedDevServerConfig),

    eventBusImplementation(updatedDevServerConfig),

    queueImplementation(updatedDevServerConfig),

    webSocketImplementation(updatedDevServerConfig),
  ]);
};
