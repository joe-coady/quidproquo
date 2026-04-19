import { defineEventBus, defineQueue, defineStorageDrive, QPQ_LOGS_STORAGE_DRIVE_NAME, QPQConfig } from 'quidproquo-core';

import { WebsocketAdminClientMessageEventType } from '../../../services/log/logic/webSocket/clientMessages/WebSocketQueueQpqAdminClientMessageEventType';
import { adminUserDirectoryResourceName } from '../adminUserDirectory';
import { defineWebSocketQueue } from '../webSocketQueue';

export const defineExposeAdminAdvancedSettings = (ownerModule: string, rootDomain: string): QPQConfig => {
  const configs: QPQConfig = [
    defineEventBus('qpq-admin-wsq', {
      owner: {
        module: ownerModule,
      },
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
      owner: {
        module: ownerModule,
      },
    }),
    // Foreign-owned reference to the log service's bucket so consumer
    // services can write their story logs directly via `storyLogger`.
    defineStorageDrive(QPQ_LOGS_STORAGE_DRIVE_NAME, {
      owner: {
        module: ownerModule,
      },
    }),
  ];

  return configs;
};
