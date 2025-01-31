import {
  CrossModuleOwnerWithNoResourceOverride,
  defineGlobal,
  defineKeyValueStore,
  QPQConfig,
  QPQConfigAdvancedSettings,
  qpqCoreUtils,
} from 'quidproquo-core';

import { getServiceEntryQpqFunctionRuntime } from '../../services';
import { defineWebsocket } from './websocket';

export interface QPQConfigAdvancedWebsocketQueueSettings extends QPQConfigAdvancedSettings {
  // keyValueStoreOwner?: CrossModuleOwner<'keyValueStoreName'>;
  // webSocketOwner?: CrossModuleOwner<'apiName'>;

  owner?: CrossModuleOwnerWithNoResourceOverride;
  userDirectoryName?: string;
}

export const defineWebSocketQueue = (
  eventBusName: string,
  apiName: string,
  rootDomain: string,
  advancedSettings?: QPQConfigAdvancedWebsocketQueueSettings,
): QPQConfig => {
  const kvsName = `wsq-${apiName}`;

  return [
    defineGlobal('qpq-wsq-kvs-name', kvsName),
    defineGlobal('qpq-wsq-ws-api-name', apiName),
    defineGlobal('qpq-wsq-eb-name', eventBusName),
    defineGlobal('qpq-wsq-ud-name', advancedSettings?.userDirectoryName || ''),

    // Store To Save Connection Info
    defineKeyValueStore(kvsName, 'id', undefined, {
      indexes: ['userId'],
      owner: qpqCoreUtils.convertCrossModuleOwnerToGenericResourceNameOverride(advancedSettings?.owner),
    }),

    // Actual web socket
    defineWebsocket(
      apiName,
      rootDomain,
      {
        onConnect: getServiceEntryQpqFunctionRuntime('webSocketQueue', 'webSocket', 'onWebsocketEvent::onConnect'),
        onDisconnect: getServiceEntryQpqFunctionRuntime('webSocketQueue', 'webSocket', 'onWebsocketEvent::onDisconnect'),
        onMessage: getServiceEntryQpqFunctionRuntime('webSocketQueue', 'webSocket', 'onWebsocketEvent::onMessage'),
      },
      {
        apiName: apiName,
        owner: qpqCoreUtils.convertCrossModuleOwnerToGenericResourceNameOverride(advancedSettings?.owner),
      },
    ),
  ];
};
