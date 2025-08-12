import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import * as crypto from 'crypto';
import path from 'path';

import {
  apiImplementation,
  eventBusImplementation,
  fileStorageImplementation,
  fileWatcherImplementation,
  queueImplementation,
  serviceFunctionImplementation,
  webSocketImplementation,
} from './implementations';
import { DevServerConfig, DevServerConfigOverrides,ResolvedDevServerConfig } from './types';

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
  console.log('Starting QPQ Dev Server!!! - this is a note');

  const runtimePath = devServerConfig.runtimePath || '.qpq-runtime';

  // Resolve the config with all defaults filled
  const resolvedDevServerConfig: ResolvedDevServerConfig = {
    ...devServerConfig,
    runtimePath,
    qpqConfigs: getDevConfigs(devServerConfig.qpqConfigs, devServerConfigOverrides),

    fileStorageConfig: {
      storagePath: path.join(runtimePath, devServerConfig.fileStorageConfig?.storagePath || 'storage'),
      secureUrlHost: devServerConfig.fileStorageConfig?.secureUrlHost || 'localhost',
      secureUrlPort: devServerConfig.fileStorageConfig?.secureUrlPort || 3001,
      secureUrlSecret: devServerConfig.fileStorageConfig?.secureUrlSecret || crypto.randomBytes(32).toString('hex'),
    },
    
    logServiceName: devServerConfig.logServiceName,
  };

  await Promise.all([
    apiImplementation(resolvedDevServerConfig),

    serviceFunctionImplementation(resolvedDevServerConfig),

    eventBusImplementation(resolvedDevServerConfig),

    queueImplementation(resolvedDevServerConfig),

    webSocketImplementation(resolvedDevServerConfig),
    
    fileStorageImplementation(resolvedDevServerConfig),
    fileWatcherImplementation(resolvedDevServerConfig),
  ]);
};
