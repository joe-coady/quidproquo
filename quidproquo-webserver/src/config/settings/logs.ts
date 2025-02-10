import {
  defineEventBus,
  defineGlobal,
  defineKeyValueStore,
  defineNotifyError,
  defineQueue,
  defineStorageDrive,
  NotifyErrorQueueEvents,
  QPQConfig,
  QPQConfigAdvancedSettings,
  StorageDriveTier,
} from 'quidproquo-core';

import {
  defineAdminServiceAuthRoute,
  defineAdminServiceLogLogRoute,
  defineAdminServiceLogRoute,
  getServiceEntryQpqFunctionRuntime,
  WebsocketAdminClientMessageEventType,
} from '../../services';
import { adminUserDirectoryResourceName } from './adminUserDirectory';
import { defineWebsocket } from './websocket';
import { defineWebSocketQueue } from './webSocketQueue';

// export type ManifestServiceUrlDefinition = QpqServiceContentSecurityPolicy & {
//   protocol: 'http' | 'https'; // Only can be serverd via http
//   domain: string;
//   path: string;
// };

// export type FederationManifestUrl = ManifestServiceUrlDefinition | string;

export interface QPQConfigAdvancedLogSettings extends QPQConfigAdvancedSettings {
  logRetentionDays?: number;
  coldStorageAfterDays?: number;

  claudeAiApiKeySecretName?: string;
}

// NEVER EVER CHANGE THIS NAME
// if you do, you might get logs generated from the logging service
// which would be recursive and bad
// its hard coded in the lambda code (TODO: remove the hard coding in lambda)
// This should be part of core
const logResourceName = 'qpq-logs';
export const logReportsResourceName = 'qpq-log-reports';

export const defineLogs = (rootDomain: string, services: string[], advancedSettings?: QPQConfigAdvancedLogSettings): QPQConfig => {
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

  const configs = [
    defineGlobal('qpq-serviceNames', services),
    defineGlobal('qpq-log-retention-days', logRetentionDays),

    defineStorageDrive(logResourceName, {
      onEvent: {
        create: getServiceEntryQpqFunctionRuntime('log', 'storageDrive', 'onCreate::onCreate'),
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

    defineAdminServiceAuthRoute('POST', '/login', 'login'),
    defineAdminServiceAuthRoute('POST', '/refreshToken', 'refreshToken'),
    defineAdminServiceAuthRoute('POST', '/challenge', 'respondToAuthChallenge'),

    defineAdminServiceLogLogRoute('POST', '/loglog/list', 'getLogLogs', routeAuthSettings),

    defineAdminServiceLogRoute('GET', '/admin/services', 'getServiceNames'),
    defineAdminServiceLogRoute('POST', '/log/list', 'getLogs', routeAuthSettings),
    defineAdminServiceLogRoute('GET', '/log/{correlationId}', 'getLog', routeAuthSettings),
    defineAdminServiceLogRoute('GET', '/log/{correlationId}/toggle', 'toggleLogCheck', routeAuthSettings),
    defineAdminServiceLogRoute('GET', '/log/children/{fromCorrelation}', 'getChildren', routeAuthSettings),
    defineAdminServiceLogRoute('GET', '/log/{correlationId}/hierarchies', 'getHierarchies', routeAuthSettings),
    defineAdminServiceLogRoute('GET', '/log/downloadurl/{correlationId}', 'downloadUrl', routeAuthSettings),
    defineAdminServiceLogRoute('POST', '/log/chat/message', 'sendChatMessage', routeAuthSettings),
    defineAdminServiceLogRoute('POST', '/log/chat', 'getChatMessages', routeAuthSettings),

    defineGlobal('claudeAi-api-key', advancedSettings?.claudeAiApiKeySecretName || ''),

    defineKeyValueStore('qpq-log-messages', 'correlationId', ['timestamp']),

    defineWebsocket(
      'wsadmin',
      rootDomain,
      {
        onConnect: getServiceEntryQpqFunctionRuntime('log', 'webSocket', 'onWebsocketEvent::onConnect'),
        onDisconnect: getServiceEntryQpqFunctionRuntime('log', 'webSocket', 'onWebsocketEvent::onDisconnect'),
        onMessage: getServiceEntryQpqFunctionRuntime('log', 'webSocket', 'onWebsocketEvent::onMessage'),
      },
      {
        apiName: 'wsadmin',
        deprecated: true,
      },
    ),

    // Web Sockets
    defineEventBus('qpq-admin-wsq'),
    defineQueue(
      'qpq-admin-websockets',
      {
        [WebsocketAdminClientMessageEventType.MarkLogChecked]: getServiceEntryQpqFunctionRuntime('log', 'queueEvent', 'webSocket::onMarkLogChecked'),
        [WebsocketAdminClientMessageEventType.RefreshLogMetadata]: getServiceEntryQpqFunctionRuntime(
          'log',
          'queueEvent',
          'webSocket::onRefreshLogMetadata',
        ),
      },
      {
        eventBusSubscriptions: ['qpq-admin-wsq'],
      },
    ),
    defineWebSocketQueue('qpq-admin-wsq', 'qpqadmin', rootDomain, {
      userDirectoryName: adminUserDirectoryResourceName,
    }),

    // Alert Logger
    defineEventBus('admin-notifier'),
    defineNotifyError('admin-notifier', {
      onAlarm: {
        publishToEventBus: ['admin-notifier'],
      },
    }),
    defineQueue(
      'admin-alarms',
      {
        [NotifyErrorQueueEvents.Error]: getServiceEntryQpqFunctionRuntime('log', 'queueEvent', 'alarm::onError'),
        [NotifyErrorQueueEvents.Timeout]: getServiceEntryQpqFunctionRuntime('log', 'queueEvent', 'alarm::onTimeout'),
        [NotifyErrorQueueEvents.Throttle]: getServiceEntryQpqFunctionRuntime('log', 'queueEvent', 'alarm::onThrottle'),
      },
      {
        eventBusSubscriptions: ['admin-notifier'],
      },
    ),
    defineKeyValueStore(
      `${logResourceName}-list`,
      {
        key: 'type',
        type: 'number',
      },
      ['timestamp'],
      {
        deprecated: advancedSettings?.deprecated,
      },
    ),
  ];

  return configs;
};
