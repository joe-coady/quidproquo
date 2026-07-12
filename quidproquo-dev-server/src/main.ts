import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import * as crypto from 'crypto';
import path from 'path';

import { warnIfLegacyKvsDatabase } from './logic/keyValueStore/warnIfLegacyKvsDatabase';
import {
  apiImplementation,
  createTinkerInterface,
  eventBusImplementation,
  fileStorageImplementation,
  fileWatcherImplementation,
  queueImplementation,
  serviceFunctionImplementation,
  webSocketImplementation,
} from './implementations';
import { DevServerConfig, DevServerConfigOverrides, ResolvedDevServerConfig, TinkerInterface, TinkerOptions } from './types';

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

const resolveDevServerConfig = (devServerConfig: DevServerConfig, devServerConfigOverrides?: DevServerConfigOverrides): ResolvedDevServerConfig => {
  const runtimePath = devServerConfig.runtimePath || '.qpq-runtime';

  return {
    ...devServerConfig,
    runtimePath,
    qpqConfigs: getDevConfigs(devServerConfig.qpqConfigs, devServerConfigOverrides),

    fileStorageConfig: {
      storagePath: path.join(runtimePath, devServerConfig.fileStorageConfig?.storagePath || 'storage'),
      secureUrlHost: devServerConfig.fileStorageConfig?.secureUrlHost || 'localhost',
      secureUrlPort: devServerConfig.fileStorageConfig?.secureUrlPort || 3001,
      secureUrlSecret: devServerConfig.fileStorageConfig?.secureUrlSecret || crypto.randomBytes(32).toString('hex'),
    },

    webRoot: devServerConfig.webRoot,

    logServiceName: devServerConfig.logServiceName,

    delay: devServerConfig.delay,
  };
};

export const startDevServer = async (devServerConfig: DevServerConfig, devServerConfigOverrides?: DevServerConfigOverrides) => {
  console.log('Starting QPQ Dev Server!!! - this is a note');

  const resolvedDevServerConfig = resolveDevServerConfig(devServerConfig, devServerConfigOverrides);
  warnIfLegacyKvsDatabase(resolvedDevServerConfig.runtimePath);

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

export const startTinker = async (
  devServerConfig: DevServerConfig,
  devServerConfigOverrides?: DevServerConfigOverrides,
  tinkerOptions?: TinkerOptions,
): Promise<TinkerInterface> => {
  console.log('Starting QPQ Tinker Environment...');

  const resolvedDevServerConfig = resolveDevServerConfig(devServerConfig, devServerConfigOverrides);
  warnIfLegacyKvsDatabase(resolvedDevServerConfig.runtimePath);

  // Start all implementations without awaiting (they run forever)
  // Just fire them off in the background
  if (tinkerOptions?.includeHttpServer) {
    apiImplementation(resolvedDevServerConfig);
  }

  serviceFunctionImplementation(resolvedDevServerConfig);
  eventBusImplementation(resolvedDevServerConfig);
  queueImplementation(resolvedDevServerConfig);
  webSocketImplementation(resolvedDevServerConfig);
  fileStorageImplementation(resolvedDevServerConfig);
  fileWatcherImplementation(resolvedDevServerConfig);

  // Give implementations a moment to initialize
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Create and return the tinker interface
  return createTinkerInterface(resolvedDevServerConfig, tinkerOptions);
};
