import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface SubdomainRedirectQPQWebServerConfigSetting extends QPQConfigSetting {
  subdomain: string;
  redirectUrl: string;
  apiBuildPath: string;
  onRootDomain: boolean;
  addEnvironment: boolean;
  addFeatureEnvironment: boolean;
}

export const defineSubdomainRedirect = (
  subdomain: string,
  apiBuildPath: string,
  redirectUrl: string,
  addEnvironment: boolean = true,
  addFeatureEnvironment: boolean = true,
  onRootDomain: boolean = true,
): SubdomainRedirectQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.SubdomainRedirect,
  uniqueKey: subdomain,

  subdomain,
  redirectUrl,

  apiBuildPath,

  addEnvironment,
  addFeatureEnvironment,
  onRootDomain,
});
