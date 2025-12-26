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
}

export const defineWebsocket = (
  apiSubdomain: string,
  rootDomain: string,
  eventProcessors: QpqWebSocketEventProcessors,
  options?: QPQConfigAdvancedWebSocketSettings,
): WebSocketQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.WebSocket,
    uniqueKey: `${apiSubdomain}.${rootDomain}`,

    apiSubdomain,
    rootDomain,

    eventProcessors,

    // advanced
    onRootDomain: options?.onRootDomain || false,
    apiName: options?.apiName || 'api',

    deprecated: options?.deprecated || false,

    cloudflareApiKeySecretName: options?.cloudflareApiKeySecretName,

    owner: qpqCoreUtils.convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
  };
};
