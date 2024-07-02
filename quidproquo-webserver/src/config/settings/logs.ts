import {
  QPQConfig,
  QPQConfigAdvancedSettings,
  StorageDriveTier,
  defineGlobal,
  defineKeyValueStore,
  defineStorageDrive,
  getServiceEntry,
} from 'quidproquo-core';
import { defineRoute } from './route';
import { defineWebEntry } from './webEntry';
import { defineWebsocket } from './websocket';
import { adminUserDirectoryResourceName } from './adminUserDirectory';
import { ContentSecurityPolicyEntry, QpqServiceContentSecurityPolicy } from '../types/ResponseSecurityHeaders';

export type ManifestServiceUrlDefinition = QpqServiceContentSecurityPolicy & {
  protocol: 'http' | 'https'; // Only can be serverd via http
  domain: string;
  path: string;
};

export type FederationManifestUrl = ManifestServiceUrlDefinition | string;

function getContentSecurityPolicyEntryFromManifestServiceUrlDefinition(url?: FederationManifestUrl): ContentSecurityPolicyEntry {
  // If its a QpqServiceContentSecurityPolicy - remove the path from the ManifestServiceUrlDefinition
  if (typeof url === 'object') {
    const { path, ...rest } = url;
    return rest;
  }

  if (!url) {
    return '';
  }

  // Use a URL object to parse the URL
  const parsedUrl = new URL(url);

  // Update the pathname of the parsed URL to root
  parsedUrl.pathname = '/';

  // Return the updated URL
  return parsedUrl.origin;
}

export interface QPQConfigAdvancedLogSettings extends QPQConfigAdvancedSettings {
  logRetentionDays?: number;
  coldStorageAfterDays?: number;

  cloudflareApiKeySecretName?: string;
  claudeAiApiKeySecretName?: string;

  federationManifestUrl?: FederationManifestUrl;
}

// NEVER EVER CHANGE THIS NAME
// if you do, you might get logs generated from the logging service
// which would be recursive and bad
// its hard coded in the lambda code (TODO: remove the hard coding in lambda)
// This should be part of core
const logResourceName = 'qpq-logs';
export const logReportsResourceName = 'qpq-log-reports';
export const wsConnectionResourceName = 'qpq-admin-connections';

export const defineLogs = (
  buildPath: string,
  webFilesPath: string,
  rootDomain: string,
  hostService: string,
  services: string[],
  advancedSettings?: QPQConfigAdvancedLogSettings,
): QPQConfig => {
  const routeAuthSettings = {
    routeAuthSettings: {
      userDirectoryName: adminUserDirectoryResourceName,
    },
  };

  /**
   * Determines the number of days to retain logs.
   *
   * - By default, logs are retained for 30 days.
   * - If `logRetentionDays` is specified in the `advancedSettings`, it will be used.
   * - If `coldStorageAfterDays` is specified, the retention is extended by an additional 180 days
   *   (to ensure logs outlive the transition period to cold storage).
   *
   * The final retention period is the maximum value between the default, specified `logRetentionDays`,
   * and `coldStorageAfterDays` plus 180.
   */
  const logRetentionDays: number | undefined = advancedSettings?.logRetentionDays
    ? Math.max(advancedSettings?.logRetentionDays || 30, advancedSettings?.coldStorageAfterDays ? advancedSettings?.coldStorageAfterDays + 180 : 0)
    : undefined;

  const qpqFederationManifestUrl = advancedSettings?.federationManifestUrl || '';

  const configs = [
    defineGlobal('qpq-serviceNames', services),
    defineGlobal('qpq-log-retention-days', logRetentionDays),
    defineGlobal('qpq-federationManifestUrl', advancedSettings?.federationManifestUrl || ''),

    defineStorageDrive(logResourceName, {
      onEvent: {
        buildPath,
        create: {
          src: getServiceEntry('log', 'storageDrive', 'onCreate'),
          runtime: 'onCreate',
        },
      },
      deprecated: advancedSettings?.deprecated,
      lifecycleRules: [
        {
          // An array or undefined based on the number of days specified > 0
          transitions:
            (advancedSettings?.coldStorageAfterDays || 0) > 0
              ? [
                  {
                    storageDriveTier: StorageDriveTier.DEEP_COLD_STORAGE,
                    transitionAfterDays: advancedSettings!.coldStorageAfterDays!,
                  },
                ]
              : undefined,
          deleteAfterDays: logRetentionDays,
        },
      ],
    }),

    defineStorageDrive(logReportsResourceName, {
      deprecated: advancedSettings?.deprecated,
      lifecycleRules: [
        {
          deleteAfterDays: 30,
        },
      ],
    }),

    defineKeyValueStore(logResourceName, 'correlation', [], {
      indexes: [
        { partitionKey: 'runtimeType', sortKey: 'startedAt' },
        { partitionKey: 'fromCorrelation', sortKey: 'startedAt' },
      ],
      ttlAttribute: 'ttl',
      deprecated: advancedSettings?.deprecated,
    }),

    defineKeyValueStore(wsConnectionResourceName, 'id', undefined, {
      indexes: ['userId'],
    }),

    defineRoute('POST', '/login', getServiceEntry('log', 'controller', 'loginController'), 'login'),
    defineRoute('POST', '/refreshToken', getServiceEntry('log', 'controller', 'loginController'), 'refreshToken'),
    defineRoute('POST', '/challenge', getServiceEntry('log', 'controller', 'loginController'), 'respondToAuthChallenge'),

    defineRoute('GET', '/admin/services', getServiceEntry('log', 'controller', 'logController'), 'getServiceNames'),
    defineRoute('GET', '/admin/fmurl', getServiceEntry('log', 'controller', 'logController'), 'getManifestUrl'),

    defineRoute('POST', '/log/list', getServiceEntry('log', 'controller', 'logController'), 'getLogs', routeAuthSettings),

    defineRoute('GET', '/log/{correlationId}', getServiceEntry('log', 'controller', 'logController'), 'getLog', routeAuthSettings),

    defineRoute('GET', '/log/{correlationId}/toggle', getServiceEntry('log', 'controller', 'logController'), 'toggleLogCheck', routeAuthSettings),

    defineRoute('GET', '/log/children/{fromCorrelation}', getServiceEntry('log', 'controller', 'logController'), 'getChildren', routeAuthSettings),

    defineRoute(
      'GET',
      '/log/{correlationId}/hierarchies',
      getServiceEntry('log', 'controller', 'logController'),
      'getHierarchies',
      routeAuthSettings,
    ),

    defineRoute('GET', '/log/downloadurl/{correlationId}', getServiceEntry('log', 'controller', 'logController'), 'downloadUrl', routeAuthSettings),

    defineRoute('POST', '/log/chat/message', getServiceEntry('log', 'controller', 'logController'), 'sendChatMessage', routeAuthSettings),

    defineGlobal('claudeAi-api-key', advancedSettings?.claudeAiApiKeySecretName || ''),

    defineRoute('POST', '/log/chat', getServiceEntry('log', 'controller', 'logController'), 'getChatMessages', routeAuthSettings),

    defineKeyValueStore('qpq-log-messages', 'correlationId', ['timestamp']),

    defineWebsocket(
      'wsadmin',
      rootDomain,
      buildPath,
      {
        onConnect: {
          src: getServiceEntry('log', 'webSocket', 'onWebsocketEvent'),
          runtime: 'onConnect',
        },
        onDisconnect: {
          src: getServiceEntry('log', 'webSocket', 'onWebsocketEvent'),
          runtime: 'onDisconnect',
        },
        onMessage: {
          src: getServiceEntry('log', 'webSocket', 'onWebsocketEvent'),
          runtime: 'onMessage',
        },
      },
      {
        apiName: 'wsadmin',
      },
    ),

    defineWebEntry('admin', {
      buildPath: webFilesPath,
      seoBuildPath: buildPath,

      domain: {
        subDomainName: 'admin',
        onRootDomain: false,
        rootDomain,
      },

      ignoreCache: ['index.html', 'index.js', 'remoteEntry.js', 'mf-manifest.json'],

      cloudflareApiKeySecretName: advancedSettings?.cloudflareApiKeySecretName,

      securityHeaders: {
        contentSecurityPolicy: {
          override: true,
          contentSecurityPolicy: {
            'default-src': ["'self'"],

            // maybe pass in the api / localhost port in as args
            'connect-src': [
              "'self'",
              { api: 'api' },
              'http://localhost:8080',
              { protocol: 'wss', api: 'wsadmin', service: hostService },
              getContentSecurityPolicyEntryFromManifestServiceUrlDefinition(qpqFederationManifestUrl),
            ],

            'style-src': [
              "'self'",
              "'unsafe-inline'", // For inline styles
            ],

            'script-src': [
              "'self'", // For scripts from the same domain
              // "'unsafe-eval'", // Allow eval() for webpack DONT DO THIS.
              getContentSecurityPolicyEntryFromManifestServiceUrlDefinition(qpqFederationManifestUrl),
            ],
          },
        },
      },
    }),
  ];

  return configs;
};
