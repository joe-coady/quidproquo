import { defineEventBus, defineQueue, QPQConfig } from 'quidproquo-core';

import { WebsocketAdminClientMessageEventType } from '../../../services';

export const defineExposeAdminAdvancedSettings = (eventBusOwner: string): QPQConfig => {
  const configs: QPQConfig = [
    defineEventBus('qpq-admin-wsq', {
      owner: {
        module: eventBusOwner,
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
  ];

  return configs;
};
