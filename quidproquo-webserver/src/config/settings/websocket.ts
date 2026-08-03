import { CrossModuleOwner, QPQConfigAdvancedSettings, QPQConfigSetting, qpqCoreUtils, QpqFunctionRuntime } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QpqWebSocketEventProcessors {
  onConnect?: QpqFunctionRuntime;
  onDisconnect?: QpqFunctionRuntime;
  onMessage?: QpqFunctionRuntime;

  // [type: string]: QpqSourceEntry;
}

export interface QPQConfigAdvancedWebSocketSettings extends QPQConfigAdvancedSettings {
  onRootDomain?: boolean;
  apiName?: string;

  cloudflareApiKeySecretName?: string;

  // Cap (and guarantee) on this websocket api's concurrent event processing:
  // never throttled below it, never scales above it. One compute unit serves all
  // the api's event processors (connect/disconnect/message), so this bounds the
  // api as a whole. Free, but carved out of the deploy account's shared
  // concurrency pool.
  maxConcurrentExecutions?: number;

  owner?: CrossModuleOwner<'websocketApiName'>;
}

export interface WebSocketQPQWebServerConfigSetting extends QPQConfigSetting {
  apiSubdomain: string;
  rootDomain: string;

  onRootDomain: boolean;

  apiName: string;

  eventProcessors: QpqWebSocketEventProcessors;

  deprecated: boolean;

  cloudflareApiKeySecretName?: string;

  maxConcurrentExecutions?: number;
}

export const defineWebsocket = (
  apiSubdomain: string,
  rootDomain: string,
  eventProcessors: QpqWebSocketEventProcessors,
  options?: QPQConfigAdvancedWebSocketSettings,
): WebSocketQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.WebSocket,
    // Deliberately domain-free. uniqueKey becomes the CDK construct id and therefore the
    // CloudFormation LOGICAL id, but every physical resource this setting creates is named
    // from app/service/environment only (e.g. the api-id SSM parameter
    // `/qpq/websocket/api-id/<apiSubdomain>-<app>-<service>-<env>`). Including rootDomain
    // meant renaming an app's domain renamed the logical id while the physical name stayed
    // put, so CloudFormation tried to CREATE a second resource holding a name the old one
    // still claimed — and it enforces name uniqueness within a stack at create time, before
    // cleanup deletes the old. Result: an undeployable stack, recoverable only by removing
    // the old logical resource in a separate update. apiSubdomain alone is unique per module
    // (that is the granularity getOwnedWebsocketSettings materialises at).
    uniqueKey: apiSubdomain,

    apiSubdomain,
    rootDomain,

    eventProcessors,

    // advanced
    onRootDomain: options?.onRootDomain || false,
    apiName: options?.apiName || 'api',

    deprecated: options?.deprecated || false,

    cloudflareApiKeySecretName: options?.cloudflareApiKeySecretName,

    maxConcurrentExecutions: options?.maxConcurrentExecutions,

    owner: qpqCoreUtils.convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
  };
};
