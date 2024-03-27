import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface DomainProxyDomainOptions {
  subDomainName?: string;
  onRootDomain: boolean;
  rootDomain: string;
}

export interface QPQConfigAdvancedDomainProxySettings extends QPQConfigAdvancedSettings {
  httpProxyDomain: string;

  domain: DomainProxyDomainOptions;

  cacheSettingsName?: string;

  ignoreCache?: string[];
}

export interface DomainProxyQPQWebServerConfigSetting extends QPQConfigSetting {
  name: string;

  domain: DomainProxyDomainOptions;
  httpProxyDomain: string;

  cacheSettingsName?: string;
  ignoreCache: string[];
}

export const defineDomainProxy = (
  name: string,
  options: QPQConfigAdvancedDomainProxySettings,
): DomainProxyQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.DomainProxy,
  uniqueKey: name,

  name,

  httpProxyDomain: options?.httpProxyDomain,

  domain: options.domain,

  ignoreCache: options?.ignoreCache || [],

  cacheSettingsName: options?.cacheSettingsName,
});
