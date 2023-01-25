import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface WebEntryQPQWebServerConfigSetting extends QPQConfigSetting {
  name: string;
  buildPath: string;
  seoBuildPath?: string;
}

export const defineWebEntry = (
  name: string,
  buildPath: string,
  seoBuildPath?: string,
): WebEntryQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.WebEntry,
  uniqueKey: name,

  name,
  buildPath,
  seoBuildPath,
});
