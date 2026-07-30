import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { askRunPendingMigrations } from 'quidproquo-webserver';

import * as crypto from 'crypto';
import path from 'path';

import { getKvsRepository } from './logic/keyValueStore/getKvsRepository';
import {
  apiImplementation,
  awaitQueueIdle,
  createTinkerInterface,
  eventBusImplementation,
  fileStorageImplementation,
  fileWatcherImplementation,
  kvsStreamImplementation,
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

  await Promise.all([
    apiImplementation(resolvedDevServerConfig),

    serviceFunctionImplementation(resolvedDevServerConfig),

    eventBusImplementation(resolvedDevServerConfig),

    kvsStreamImplementation(resolvedDevServerConfig),
    queueImplementation(resolvedDevServerConfig),

    webSocketImplementation(resolvedDevServerConfig),

    fileStorageImplementation(resolvedDevServerConfig),
    fileWatcherImplementation(resolvedDevServerConfig),
  ]);
};

/**
 * Run every pending migration once, then resolve. The engine behind `qpq migrate`.
 *
 * Migrations are triggered by a deploy event, and nothing locally ever deploys, so without
 * this they simply never run on a dev machine — you find out what a migration does the first
 * time you ship it. This runs them through the SAME queue the deployed path uses, so a local
 * run rehearses the real thing rather than a convenient approximation.
 *
 * Each service is migrated in turn, and the queue is drained before moving on, so ordering
 * between a migration and anything it enqueues holds.
 */
export const runMigrations = async (
  devServerConfig: DevServerConfig,
  devServerConfigOverrides?: DevServerConfigOverrides,
): Promise<Record<string, string[]>> => {
  const resolvedDevServerConfig = resolveDevServerConfig(devServerConfig, devServerConfigOverrides);

  // The queue is what actually executes a migration, and the kvs stream keeps projections in
  // step with whatever it writes. Nothing else is needed: no http server, no websockets.
  // NOT awaited: these block forever by design (startDevServer runs them inside Promise.all
  // alongside the http server). Awaiting one hangs the whole command silently.
  void queueImplementation(resolvedDevServerConfig);
  void kvsStreamImplementation(resolvedDevServerConfig);

  // Let them register their bus listeners before anything is published, exactly as
  // startTinker does.
  await new Promise((resolve) => setTimeout(resolve, 100));

  const tinker = createTinkerInterface(resolvedDevServerConfig);
  const ran: Record<string, string[]> = {};

  for (const serviceName of tinker.getServices()) {
    tinker.switchService(serviceName);

    const result = await tinker.run(askRunPendingMigrations);

    if (result.error) {
      throw new Error(`Migration failed for service [${serviceName}]: ${result.error.errorText}`);
    }

    // Enqueueing is not running: wait for the handlers themselves before calling this service
    // done, or a failure would surface after we had already reported success.
    await awaitQueueIdle();

    ran[serviceName] = result.result ?? [];
  }

  // Kvs writes are debounced behind an unref'd timer, so without this a one-shot command can
  // report a successful migration and exit with the rows still only in memory. Found the hard
  // way: the last service migrated always lost its writes.
  //
  // One repository per service, so every config has to be flushed, not just the first.
  await Promise.all(
    resolvedDevServerConfig.qpqConfigs.map((serviceQpqConfig) => getKvsRepository(serviceQpqConfig, resolvedDevServerConfig).flushAll()),
  );

  return ran;
};

export const startTinker = async (
  devServerConfig: DevServerConfig,
  devServerConfigOverrides?: DevServerConfigOverrides,
  tinkerOptions?: TinkerOptions,
): Promise<TinkerInterface> => {
  console.log('Starting QPQ Tinker Environment...');

  const resolvedDevServerConfig = resolveDevServerConfig(devServerConfig, devServerConfigOverrides);

  // Start all implementations without awaiting (they run forever)
  // Just fire them off in the background
  if (tinkerOptions?.includeHttpServer) {
    apiImplementation(resolvedDevServerConfig);
  }

  serviceFunctionImplementation(resolvedDevServerConfig);
  eventBusImplementation(resolvedDevServerConfig);
  kvsStreamImplementation(resolvedDevServerConfig);
  queueImplementation(resolvedDevServerConfig);
  webSocketImplementation(resolvedDevServerConfig);
  fileStorageImplementation(resolvedDevServerConfig);
  fileWatcherImplementation(resolvedDevServerConfig);

  // Give implementations a moment to initialize
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Create and return the tinker interface
  return createTinkerInterface(resolvedDevServerConfig, tinkerOptions);
};
