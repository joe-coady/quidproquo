import { QPQConfigSetting, QPQConfigAdvancedSettings, generateSimpleHash } from 'quidproquo-core';

import { QPQWebServerConfigSettingType, CacheSettings } from '../QPQConfig';

export interface QPQConfigAdvancedSeoSettings extends QPQConfigAdvancedSettings {
  webEntry?: string;
  cacheSettingsName?: string;
}

export interface SeoQPQWebServerConfigSetting extends QPQConfigSetting {
  path: string;
  src: string;
  runtime: string;
  deprecated: boolean;
  webEntry?: string;

  cacheSettingsName?: string;
}

export const defineSeo = (
  path: string,
  src: string,
  runtime: string,
  options?: QPQConfigAdvancedSeoSettings,
): SeoQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.Seo,
  uniqueKey: generateSimpleHash(path),

  path,
  src,
  runtime,

  webEntry: options?.webEntry,
  deprecated: options?.deprecated || false,

  cacheSettingsName: options?.cacheSettingsName,
});
