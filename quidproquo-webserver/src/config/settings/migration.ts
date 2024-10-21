import {
  QPQConfig,
  defineDeployEvent,
  defineKeyValueStore,
  QpqFunctionRuntime,
  DeployEventType,
  defineQueue,
  defineGlobal,
  QPQConfigAdvancedSettings,
  qpqCoreUtils,
} from 'quidproquo-core';
import { getServiceEntryQpqFunctionRuntime } from '../../services';

export interface Migration {
  runtime: QpqFunctionRuntime;
  deployType: DeployEventType;
}

export interface QPQConfigAdvancedMigrationSettings extends QPQConfigAdvancedSettings {}

export const defineMigration = (migrations: Migration[], options?: QPQConfigAdvancedMigrationSettings): QPQConfig => {
  return [
    // Define a global so we can access the migrations from the src
    defineGlobal('qpqMigrations', migrations),

    // Create a kvs so we can track which migrations have been run
    defineKeyValueStore('qpqMigrations', 'srcPath', ['deployType'], options),

    // Listen to deploy events
    defineDeployEvent('qpqMigrations', getServiceEntryQpqFunctionRuntime('migration', 'deployEvent', 'onDeploy::onDeploy')),

    // Build up a queue where the src names are the event types
    defineQueue(
      'qpqMigrations',
      migrations.reduce(
        (acc, m) => ({
          ...acc,
          [qpqCoreUtils.getSrcPathFromQpqFunctionRuntimeWithoutLeadingSlash(m.runtime)]: m.runtime,
        }),
        {},
      ),
      {
        ...options,
        maxConcurrentExecutions: 1,
        batchSize: 1,
        concurrency: 1,
      },
    ),
  ];
};
