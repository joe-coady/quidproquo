import { QPQConfigSetting, QPQConfigAdvancedSettings, QpqSourceEntry } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QpqWebSocketEventProcessors {
  onConnect: QpqSourceEntry;
  onDisconnect: QpqSourceEntry;
  onMessage: QpqSourceEntry;

  // [type: string]: QpqSourceEntry;
}

export interface QPQConfigAdvancedWebSocketSettings extends QPQConfigAdvancedSettings {
  onRootDomain?: boolean;
  apiName?: string;
}

export interface WebSocketQPQWebServerConfigSetting extends QPQConfigSetting {
  apiSubdomain: string;

  onRootDomain: boolean;
  apiName: string;
  buildPath: string;

  eventProcessors: QpqWebSocketEventProcessors

  deprecated: boolean;
}

export const defineWebsocket = (
  apiSubdomain: string,
  buildPath: string,
  eventProcessors: QpqWebSocketEventProcessors,
  options?: QPQConfigAdvancedWebSocketSettings,
): WebSocketQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.WebSocket,
    uniqueKey: apiSubdomain,

    apiSubdomain,
    buildPath,

    eventProcessors,

    // advanced
    onRootDomain: options?.onRootDomain || false,
    apiName: options?.apiName || 'api',

    deprecated: options?.deprecated || false,
  };
};
