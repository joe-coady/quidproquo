import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface SubdomainRedirectQPQWebServerConfigSetting extends QPQConfigSetting {
  subdomain: string;
  redirectUrl: string;
  addFeatureEnvironment: boolean;
}

export const defineSubdomainRedirect = (
  subdomain: string,
  redirectUrl: string,
  addFeatureEnvironment: boolean = false,
): SubdomainRedirectQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.SubdomainRedirect,
  uniqueKey: subdomain,

  subdomain,
  redirectUrl,
  addFeatureEnvironment,
});
