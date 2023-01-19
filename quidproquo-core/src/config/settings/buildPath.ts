import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface BuildPathQPQConfigSetting extends QPQConfigSetting {
  buildPath: string;
}

export const defineBuildPath = (buildPath: string): BuildPathQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.buildPath,

  buildPath,
});
