import { QPQConfig, QPQConfigAdvancedSettings, defineGlobal, defineKeyValueStore, defineStorageDrive, defineUserDirectory, getServiceEntry } from 'quidproquo-core';
import { defineRoute } from './route';
import { defineWebEntry } from './webEntry';

export interface QPQConfigAdvancedLogSettings extends QPQConfigAdvancedSettings {
  logRetentionDays?: number;
}

// NEVER EVER CHANGE THIS NAME
// if you do, you might get logs generated from the logging service
// which would be recursive and bad
// its hard coded in the lambda code (TODO: remove the hard coding in lambda)
// This should be part of core

const logResourceName = 'qpq-logs';

export const defineLogs = (
  buildPath: string,
  webFilesPath: string,
  advancedSettings?: QPQConfigAdvancedLogSettings,
): QPQConfig => {
  
  const routeAuthSettings = {
    routeAuthSettings: {
      userDirectoryName: 'qpq-admin',
    },
  };

  const configs = [
    defineGlobal("qpq-log-retention-days", advancedSettings?.logRetentionDays || 30),

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
      },
      deprecated: advancedSettings?.deprecated,
    }),

    defineKeyValueStore(logResourceName, 'correlation', [], {
      indexes: [
        { partitionKey: 'runtimeType', sortKey: 'startedAt' },
        { partitionKey: 'fromCorrelation', sortKey: 'startedAt' }
      ],
      ttlAttribute: 'ttl',
      deprecated: advancedSettings?.deprecated,
    }),

    // defineApi('logs', buildPath, {
    //   apiName: 'logs'
    // }),

    defineUserDirectory('qpq-admin', buildPath),
    defineRoute('POST', '/login', getServiceEntry('log', 'controller', 'loginController'), 'login'),
    defineRoute('POST', '/refreshToken', getServiceEntry('log', 'controller', 'loginController'), 'refreshToken'),
    defineRoute('POST', '/challenge', getServiceEntry('log', 'controller', 'loginController'), 'respondToAuthChallenge'),

    defineRoute(
      'POST',
      '/log/list',
      getServiceEntry('log', 'controller', 'logController'),
      'getLogs',
      routeAuthSettings
    ),

    defineRoute(
      'GET',
      '/log/{correlationId}',
      getServiceEntry('log', 'controller', 'logController'),
      'getLog',
      routeAuthSettings
    ),

    defineRoute(
      'GET',
      '/log/children/{fromCorrelation}',
      getServiceEntry('log', 'controller', 'logController'),
      'getChildren',
      routeAuthSettings
    ),

    defineRoute(
      'GET',
      '/log/download/{correlationId}',
      getServiceEntry('log', 'controller', 'logController'),
      'downloadLog',
      routeAuthSettings
    ),

    defineWebEntry('admin', {
      buildPath: webFilesPath,
      domain: {
        subDomainName: 'admin',
        onRootDomain: false
      },

      ignoreCache: ['index.html', 'index.js'],

      securityHeaders: {
        contentSecurityPolicy: {
          override: true,
          contentSecurityPolicy: {
            'default-src': ["'self'"],
            
            'connect-src': [
              "'self'"
            ],
            
            'style-src': [
              "'self'",
              "'unsafe-inline'", // For inline styles
            ],
    
            'script-src': [
              "'self'", // For scripts from the same domain
            ],
          },
        },
      },
    })
  ];

  return configs;
};
