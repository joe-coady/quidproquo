import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface WebEntryQPQWebServerConfigSetting extends QPQConfigSetting {
  buildPath: string;
  seoBuildPath?: string;
}

export const defineWebEntry = (
  buildPath: string,
  seoBuildPath?: string,
): WebEntryQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.WebEntry,
  uniqueKey: buildPath,

  buildPath,
  seoBuildPath,
});
