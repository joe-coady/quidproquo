import {
  defineEventBus,
  defineGlobal,
  defineKeyValueStore,
  defineNotifyError,
  defineQueue,
  defineServiceSettings,
  defineStorageDrive,
  NotifyErrorQueueEvents,
  QPQ_LOG_REPORTS_STORAGE_DRIVE_NAME,
  QPQ_LOGS_STORAGE_DRIVE_NAME,
  QPQConfig,
  QPQConfigAdvancedSettings,
  StorageDriveTier,
} from 'quidproquo-core';

import { getServiceEntryQpqFunctionRuntime } from '../../../services/getServiceEntryQpqFunctionRuntime';
import { defineAdminServiceAuthRoute } from '../../../services/log/config/defineAdminServiceAuthRoute';
import { defineAdminServiceLogLogRoute } from '../../../services/log/config/defineAdminServiceLogLogRoute';
import { defineAdminServiceLogRoute } from '../../../services/log/config/defineAdminServiceLogRoute';
import { WebsocketAdminClientMessageEventType } from '../../../services/log/logic/webSocket/clientMessages/WebSocketQueueQpqAdminClientMessageEventType';
import { adminUserDirectoryResourceName } from '../adminUserDirectory';
import { defineWebSocketQueue } from '../webSocketQueue';

export interface QPQConfigAdvancedLogSettings extends QPQConfigAdvancedSettings {
  logRetentionDays?: number;
  coldStorageAfterDays?: number;

  claudeAiApiKeySecretName?: string;

  services?: string[];
}

// Retention defaults to undefined (no expiry) unless `logRetentionDays` is set.
// If `coldStorageAfterDays` is set, retention is padded by 180 days so logs
// outlive the cold-storage transition window.
const calculateLogRetentionDays = (advancedSettings?: QPQConfigAdvancedLogSettings): number | undefined => {
  if (!advancedSettings?.logRetentionDays) return undefined;
  const coldStorageExtension = (advancedSettings.coldStorageAfterDays ?? 0) > 0 ? advancedSettings.coldStorageAfterDays! + 180 : 0;
  return Math.max(advancedSettings.logRetentionDays, coldStorageExtension);
};

export const defineAdminSettings = (
  logServiceName: string,
  rootDomain: string,
  advancedSettings?: QPQConfigAdvancedLogSettings,
): QPQConfig => {
  const routeAuthSettings = {
    routeAuthSettings: {
      userDirectoryName: adminUserDirectoryResourceName,
    },
  };

  const logRetentionDays = calculateLogRetentionDays(advancedSettings);

  return [
    // Owner-stamped resources — materialise as owned on the admin deploy,
    // and as foreign refs elsewhere. Owner resolution runs at IAM-scoping time.
    defineEventBus('qpq-admin-wsq', {
      owner: { module: logServiceName },
    }),

    defineQueue(
      'qpq-admin-ws-config',
      {
        [WebsocketAdminClientMessageEventType.ConfigSyncRequest]: {
          basePath: __dirname,
          functionName: 'onConfigSyncRequest',
          relativePath: 'entry/queue/webSocket',
        },
      },
      {
        eventBusSubscriptions: ['qpq-admin-wsq'],
      },
    ),

    defineWebSocketQueue('qpq-admin-wsq', 'qpqadmin', rootDomain, {
      userDirectoryName: adminUserDirectoryResourceName,
      owner: { module: logServiceName },
    }),

    defineStorageDrive(QPQ_LOGS_STORAGE_DRIVE_NAME, {
      owner: { module: logServiceName },
      onEvent: {
        create: getServiceEntryQpqFunctionRuntime('log', 'storageDrive', 'onCreate::onCreate'),
      },
      deprecated: advancedSettings?.deprecated,
      lifecycleRules: [
        {
          transitions:
            (advancedSettings?.coldStorageAfterDays ?? 0) > 0
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

    // Admin-only resources — only flatten out when the deploying service is the log service.
    defineServiceSettings({
      [logServiceName]: [
        defineStorageDrive(QPQ_LOG_REPORTS_STORAGE_DRIVE_NAME, {
          deprecated: advancedSettings?.deprecated,
          lifecycleRules: [{ deleteAfterDays: 30 }],
        }),

        defineKeyValueStore(QPQ_LOGS_STORAGE_DRIVE_NAME, 'correlation', [], {
          indexes: [
            { partitionKey: 'runtimeType', sortKey: 'startedAt' },
            { partitionKey: 'fromCorrelation', sortKey: 'startedAt' },
          ],
          ttlAttribute: 'ttl',
          deprecated: advancedSettings?.deprecated,
        }),

        defineKeyValueStore('qpq-log-messages', 'correlationId', ['timestamp']),

        defineKeyValueStore(
          `${QPQ_LOGS_STORAGE_DRIVE_NAME}-list`,
          { key: 'type', type: 'number' },
          ['timestamp'],
          {
            deprecated: advancedSettings?.deprecated,
          },
        ),

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

        defineGlobal('qpq-serviceNames', advancedSettings?.services ?? []),
        defineGlobal('qpq-log-retention-days', logRetentionDays),
        defineGlobal('claudeAi-api-key', advancedSettings?.claudeAiApiKeySecretName ?? ''),
      ],
    }),
  ];
};
