import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface WebEntryQPQWebServerConfigSetting extends QPQConfigSetting {
  buildPath: string;
}

export const defineWebEntry = (buildPath: string): WebEntryQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.WebEntry,

  buildPath,
});
