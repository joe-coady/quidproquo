import { QPQConfig, defineKeyValueStore, defineStorageDrive, getServiceEntry } from 'quidproquo-core';
import { defineRoute } from './route';
import { defineApi } from './api';

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

    // defineApi('logs', buildPath, {
    //   apiName: 'logs'
    // }),

    defineRoute(
      'POST',
      '/log/list',
      getServiceEntry('log', 'controller', 'logController'),
      'getLogs'
    ),

    defineRoute(
      'GET',
      '/log/{correlationId}',
      getServiceEntry('log', 'controller', 'logController'),
      'getLog',
    ),

    defineRoute(
      'GET',
      '/log/children/{fromCorrelation}',
      getServiceEntry('log', 'controller', 'logController'),
      'getChildren',
    ),
  ];

  return configs;
};
