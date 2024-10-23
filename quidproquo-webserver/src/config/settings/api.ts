import { QPQConfigAdvancedSettings,QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedApiSettings extends QPQConfigAdvancedSettings {
  subDomain?: string;
  cloudflareApiKeySecretName?: string;
  virtualNetworkName?: string;
}

export interface ApiQPQWebServerConfigSetting extends QPQConfigSetting {
  apiSubdomain: string;
  rootDomain: string;

  apiName: string;

  deprecated: boolean;

  cloudflareApiKeySecretName?: string;

  virtualNetworkName?: string;
}

export const defineApi = (apiName: string, rootDomain: string, options?: QPQConfigAdvancedApiSettings): ApiQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.Api,
    uniqueKey: apiName,

    apiSubdomain: options?.subDomain || apiName,
    rootDomain,

    apiName: apiName,

    deprecated: options?.deprecated || false,

    cloudflareApiKeySecretName: options?.cloudflareApiKeySecretName,

    virtualNetworkName: options?.virtualNetworkName,
  };
};
