import { QPQConfig, defineKeyValueStore, defineStorageDrive } from 'quidproquo-core';

export const defineLogs = (buildPath: string): QPQConfig => {
  // comment
  const configs = [
    defineStorageDrive('qpq-logs', {
      onEvent: {
        buildPath,
        create: {
          src: "",
          runtime: ""
        }
      }
    }),

    defineKeyValueStore('qpq-logs', 'runtimeType', ['startedAtWithCorrelation'], {
      indexes: ['fromCorrelation']
    }),
  ];

  return configs;
};
