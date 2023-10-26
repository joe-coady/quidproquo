import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedApiSettings extends QPQConfigAdvancedSettings {
  onRootDomain?: boolean;
  apiName?: string;

  cloudFlareApiKeySecretName?: string;
}

export interface ApiQPQWebServerConfigSetting extends QPQConfigSetting {
  apiSubdomain: string;

  onRootDomain: boolean;
  apiName: string;
  buildPath: string;

  deprecated: boolean;

  cloudFlareApiKeySecretName?: string;
}

export const defineApi = (
  apiSubdomain: string,
  buildPath: string,
  options?: QPQConfigAdvancedApiSettings,
): ApiQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.Api,
    uniqueKey: apiSubdomain,

    apiSubdomain,
    buildPath,

    // advanced
    onRootDomain: options?.onRootDomain || false,
    apiName: options?.apiName || 'api',

    deprecated: options?.deprecated || false,

    cloudFlareApiKeySecretName: options?.cloudFlareApiKeySecretName,
  };
};
