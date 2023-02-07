import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType, CacheSettings } from '../QPQConfig';

export interface SeoCacheSettings extends CacheSettings {
  headers: string[];
}

export interface QPQConfigAdvancedSeoSettings extends QPQConfigAdvancedSettings {
  webEntry?: string;
  cache?: SeoCacheSettings;
}

export interface SeoQPQWebServerConfigSetting extends QPQConfigSetting {
  path: string;
  src: string;
  runtime: string;
  deprecated: boolean;
  webEntry?: string;

  cache: SeoCacheSettings;
}

export const defineSeo = (
  path: string,
  src: string,
  runtime: string,
  options?: QPQConfigAdvancedSeoSettings,
): SeoQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.Seo,
  uniqueKey: runtime,

  path,
  src,
  runtime,

  webEntry: options?.webEntry,
  deprecated: options?.deprecated || false,

  cache: options?.cache || {
    defaultTTLInSeconds: 86400,
    minTTLInSeconds: 900,
    maxTTLInSeconds: 172800,
    headers: [],
  },
});
