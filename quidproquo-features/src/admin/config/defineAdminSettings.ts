import {
  AiModel,
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
import { defineServiceFunction } from 'quidproquo-webserver';

import { defineEventDocAi } from '../../eventDocAi';
import { getFeatureEntryQpqFunctionRuntime } from '../../getFeatureEntryQpqFunctionRuntime';
import { defineWebSocketQueue } from '../../webSocketQueue';
import { adminLogAiSystemPrompt } from '../constants/adminLogAiSystemPrompt';
import {
  defineAdminServiceAuthRoute,
  defineAdminServiceLogLogRoute,
  defineAdminServiceLogRoute,
  QPQ_STORE_TRACE_RESULT_SERVICE_FUNCTION_NAME,
  QPQ_TRACE_LOG_SERVICE_FUNCTION_NAME,
  WebsocketAdminClientMessageEventType,
} from '../log';
import { adminUserDirectoryResourceName } from './adminUserDirectory';
import { adminLogAiTools, defineAdminLogAiTools } from './defineAdminLogAiTools';
import { defineAdminSessionEventDoc } from './defineAdminSessionEventDoc';

export interface QPQConfigAdvancedLogSettings extends QPQConfigAdvancedSettings {
  logRetentionDays?: number;
  coldStorageAfterDays?: number;

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

export const defineAdminSettings = (logServiceName: string, rootDomain: string, advancedSettings?: QPQConfigAdvancedLogSettings): QPQConfig => {
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
      'qpqadmin-wscfg',
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

    // Every service exposes the log-replay tracer as a service function, so the admin
    // log service can trace any log INSIDE the service that owns it (right module
    // loader / federated code store). See trace-replay-plan.md.
    defineServiceFunction(
      {
        basePath: __dirname,
        relativePath: 'entry/serviceFunction/qpqTraceLogExecution',
        functionName: 'qpqTraceLogExecution',
      },
      {
        functionName: QPQ_TRACE_LOG_SERVICE_FUNCTION_NAME,
      },
    ),

    defineStorageDrive(QPQ_LOGS_STORAGE_DRIVE_NAME, {
      owner: { module: logServiceName },
      onEvent: {
        create: getFeatureEntryQpqFunctionRuntime('admin/log', 'storageDrive', 'onCreate::onCreate'),
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

        // The reply channel for async traces: owning services send finished traces
        // here; this stores them and pushes a TraceDone websocket message to admins.
        defineServiceFunction(getFeatureEntryQpqFunctionRuntime('admin/log', 'serviceFunction', 'traceStore::qpqStoreTraceResult'), {
          functionName: QPQ_STORE_TRACE_RESULT_SERVICE_FUNCTION_NAME,
        }),

        defineKeyValueStore(`${QPQ_LOGS_STORAGE_DRIVE_NAME}-list`, { key: 'type', type: 'number' }, ['timestamp'], {
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
        defineAdminServiceLogRoute('POST', '/log/{correlationId}/trace', 'traceLog', routeAuthSettings),

        // The log chat: a generic EventDocAi instance scoped to `docId` = log correlation id,
        // with tools instead of the log pasted into the prompt (see adminLogAiSystemPrompt).
        defineEventDocAi({
          storeName: 'log',
          type: 'log',
          serviceName: logServiceName,
          eventBusName: 'qpq-admin-wsq',
          userDirectoryName: adminUserDirectoryResourceName,
          model: AiModel.ClaudeSonnet46,
          systemPrompt: adminLogAiSystemPrompt,
          tools: adminLogAiTools,
        }),
        defineAdminLogAiTools(),

        defineQueue(
          'qpq-admin-websockets',
          {
            [WebsocketAdminClientMessageEventType.MarkLogChecked]: getFeatureEntryQpqFunctionRuntime(
              'admin/log',
              'queueEvent',
              'webSocket::onMarkLogChecked',
            ),
            [WebsocketAdminClientMessageEventType.RefreshLogMetadata]: getFeatureEntryQpqFunctionRuntime(
              'admin/log',
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
            [NotifyErrorQueueEvents.Error]: getFeatureEntryQpqFunctionRuntime('admin/log', 'queueEvent', 'alarm::onError'),
            [NotifyErrorQueueEvents.Timeout]: getFeatureEntryQpqFunctionRuntime('admin/log', 'queueEvent', 'alarm::onTimeout'),
            [NotifyErrorQueueEvents.Throttle]: getFeatureEntryQpqFunctionRuntime('admin/log', 'queueEvent', 'alarm::onThrottle'),
          },
          {
            eventBusSubscriptions: ['admin-notifier'],
          },
        ),

        defineGlobal('qpq-serviceNames', advancedSettings?.services ?? []),
        defineGlobal('qpq-log-retention-days', logRetentionDays),
        defineGlobal('qpq-log-service-name', logServiceName),
      ],
    }),

    // The admin UI's audited session event doc — one doc per login.
    ...defineAdminSessionEventDoc(logServiceName),
  ];
};
