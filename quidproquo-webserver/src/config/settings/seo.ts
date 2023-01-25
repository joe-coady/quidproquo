import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export type SeoOptions = {};

export interface SeoQPQWebServerConfigSetting extends QPQConfigSetting {
  path: string;
  src: string;
  runtime: string;
  options: SeoOptions;
}

export const defineSeo = (
  path: string,
  src: string,
  runtime: string,
  options: SeoOptions = {},
): SeoQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.Seo,
  uniqueKey: runtime,

  path,
  src,
  runtime,
  options,
});
