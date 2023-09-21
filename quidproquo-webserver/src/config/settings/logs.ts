import { QPQConfig, defineKeyValueStore, defineStorageDrive } from 'quidproquo-core';

export const defineLogs = (): QPQConfig => {
  // comment
  const configs = [
    defineStorageDrive('qpq-logs'),

    defineKeyValueStore('qpq-logs', 'runtimeType', ['startedAtWithCorrelation'], {
      indexes: ['fromCorrelation']
    }),
  ];

  return configs;
};
