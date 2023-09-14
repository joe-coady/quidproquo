import { QPQConfig, defineDeployEvent, defineKeyValueStore, QpqSourceEntry, DeployEventType, defineQueue, defineGlobal, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { getServiceEntry } from '../../utils/serviceConfig';

export interface Migration {
  src: QpqSourceEntry;
  deployType: DeployEventType;
}

export interface QPQConfigAdvancedMigrationSettings extends QPQConfigAdvancedSettings {
  
}

export const defineMigration = (buildPath: string, migrations: Migration[], options?: QPQConfigAdvancedMigrationSettings): QPQConfig => {

  return [
    // Define a global so we can access the migrations from the src
    defineGlobal('qpqMigrations', migrations),

    // Create a kvs so we can track which migrations have been run
    defineKeyValueStore('qpqMigrations', 'srcPath', ['deployType'], options),
  
    // Listen to deploy events
    defineDeployEvent(buildPath, 'qpqMigrations', {
      src: getServiceEntry('migration', 'deployEvent', 'onDeploy'),
      runtime: 'onDeploy'
    }),
  
    // Build up a queue where the src names are the event types
    defineQueue('qpqMigrations', buildPath, migrations.reduce((acc, m) => ({
      ...acc,
      [m.src.src]: m.src
    }), {}), {
      ...options,
      maxConcurrentExecutions: 1,
      batchSize: 1,
      concurrency: 1
    })
  ];
};
