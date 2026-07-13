import { QPQConfig } from 'quidproquo-core';

import { defineWebSocketQueue, QPQConfigAdvancedWebsocketQueueSettings } from '../../webSocketQueue';
import { TENANT_CONNECTION_SCOPE_VALIDATOR_FN } from '../constants/tenantStoreNames';

export type QPQConfigAdvancedTenantedWebsocketQueueSettings = Omit<QPQConfigAdvancedWebsocketQueueSettings, 'connectionScopeValidator'>;

// A defineWebSocketQueue with the tenant membership check pre-wired as the
// connection scope validator, so a scope claimed in the ws Authenticate
// handshake is only stored when the user belongs to that tenant. The deploying
// service must still register the validator implementation by calling
// defineTenant.
export const defineTenantedWebSocketQueue = (
  eventBusName: string,
  apiName: string,
  rootDomain: string,
  advancedSettings?: QPQConfigAdvancedTenantedWebsocketQueueSettings,
): QPQConfig =>
  defineWebSocketQueue(eventBusName, apiName, rootDomain, {
    ...advancedSettings,
    connectionScopeValidator: TENANT_CONNECTION_SCOPE_VALIDATOR_FN,
  });
