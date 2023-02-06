import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedSeoSettings extends QPQConfigAdvancedSettings {
  webEntry?: string;
}

export interface SeoQPQWebServerConfigSetting extends QPQConfigSetting {
  path: string;
  src: string;
  runtime: string;
  deprecated: boolean;
  webEntry?: string;
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
});
