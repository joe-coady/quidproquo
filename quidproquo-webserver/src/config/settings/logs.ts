import { QPQConfig, defineKeyValueStore, defineStorageDrive, getServiceEntry } from 'quidproquo-core';

export const defineLogs = (buildPath: string): QPQConfig => {
  // comment
  const configs = [
    defineStorageDrive('qpq-logs', {
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

    defineKeyValueStore('qpq-logs', 'runtimeType', ['startedAtWithCorrelation'], {
      indexes: ['fromCorrelation']
    }),
  ];

  return configs;
};
