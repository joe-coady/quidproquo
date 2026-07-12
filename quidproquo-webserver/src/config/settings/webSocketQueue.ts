import {
  CrossModuleOwnerWithNoResourceOverride,
  defineGlobal,
  defineKeyValueStore,
  QPQConfig,
  QPQConfigAdvancedSettings,
  qpqCoreUtils,
} from 'quidproquo-core';

import { getServiceEntryQpqFunctionRuntime } from '../../services/getServiceEntryQpqFunctionRuntime';
import { defineWebsocket } from './websocket';

export interface QPQConfigAdvancedWebsocketQueueSettings extends QPQConfigAdvancedSettings {
  owner?: CrossModuleOwnerWithNoResourceOverride;
  userDirectoryName?: string;

  // Registered inline-function name (see `defineInlineFunction`) invoked with
  // `{ userId, requestedScope }` when an Authenticate message claims a storage
  // scope (e.g. a tenant id); must return true for the claim to be stored on
  // the connection. A claim with NO validator configured is rejected outright.
  connectionScopeValidator?: string;
}

export function getWebSocketQueueGlobalConfigKeyForEventBusName(apiName: string): string {
  return `qpq-wsq-eb-name-${apiName}`;
}

export function getWebSocketQueueGlobalConfigKeyForUserDirectoryName(apiName: string): string {
  return `qpq-wsq-kvs-name-${apiName}`;
}

export function getWebSocketQueueGlobalConfigKeyForConnectionScopeValidator(apiName: string): string {
  return `qpq-wsq-scope-validator-${apiName}`;
}

export function getWebSocketQueueKeyValueStoreName(apiName: string): string {
  return `qpq-wsq-${apiName}`;
}

export const defineWebSocketQueue = (
  eventBusName: string,
  apiName: string,
  rootDomain: string,
  advancedSettings?: QPQConfigAdvancedWebsocketQueueSettings,
): QPQConfig => {
  return [
    // User defined vars (stored in config)
    defineGlobal(getWebSocketQueueGlobalConfigKeyForEventBusName(apiName), eventBusName),
    defineGlobal(getWebSocketQueueGlobalConfigKeyForUserDirectoryName(apiName), advancedSettings?.userDirectoryName || ''),
    defineGlobal(getWebSocketQueueGlobalConfigKeyForConnectionScopeValidator(apiName), advancedSettings?.connectionScopeValidator || ''),

    // Store To Save Connection Info
    defineKeyValueStore(getWebSocketQueueKeyValueStoreName(apiName), 'id', undefined, {
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
