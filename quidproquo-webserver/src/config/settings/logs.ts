import { QPQConfig, defineKeyValueStore, defineStorageDrive, getServiceEntry } from 'quidproquo-core';

// NEVER EVER CHANGE THIS NAME
// if you do, you might get logs generated from the logging service
// which would be recursive and bad
// its hard coded in the lambda code (TODO: remove the hard coding in lambda)
// This should be part of core

const logResourceName = 'qpq-logs';

export const defineLogs = (buildPath: string): QPQConfig => {
  // comment
  const configs = [
    defineStorageDrive(logResourceName, {
      onEvent: {
        buildPath,
        create: {
          src: getServiceEntry(
            'log',
            'storageDrive',
            'onCreate',
          ),
          runtime: "onCreate"
        }
      }
    }),

    defineKeyValueStore(logResourceName, 'correlation', [], {
      indexes: [
        { partitionKey: 'runtimeType', sortKey: 'startedAt' },
        { partitionKey: 'fromCorrelation', sortKey: 'startedAt' }
      ]
    }),
  ];

  return configs;
};
