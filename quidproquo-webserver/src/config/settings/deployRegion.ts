import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface DeployRegionQPQWebServerConfigSetting extends QPQConfigSetting {
  deployRegion: string;
}

export const defineDeployRegion = (deployRegion: string): DeployRegionQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.DeployRegion,

    deployRegion,
  };
};
