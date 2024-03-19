import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedApiSettings extends QPQConfigAdvancedSettings {
  subDomain?: string;
  buildPath?: string;
  cloudflareApiKeySecretName?: string;
}

export interface ApiQPQWebServerConfigSetting extends QPQConfigSetting {
  apiSubdomain: string;
  rootDomain: string;

  apiName: string;
  buildPath?: string;

  deprecated: boolean;

  cloudflareApiKeySecretName?: string;
}

export const defineApi = (
  apiName: string,
  rootDomain: string,
  options?: QPQConfigAdvancedApiSettings,
): ApiQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.Api,
    uniqueKey: apiName,

    apiSubdomain: options?.subDomain || apiName,
    buildPath: options?.buildPath,
    rootDomain,

    apiName: apiName,

    deprecated: options?.deprecated || false,

    cloudflareApiKeySecretName: options?.cloudflareApiKeySecretName,
  };
};
