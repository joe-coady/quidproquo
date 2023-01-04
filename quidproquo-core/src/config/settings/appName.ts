import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface AppNameQPQConfigSetting extends QPQConfigSetting {
  appName: string;
  featureName?: string;
}

export const defineAppName = (appName: string, featureName?: string): AppNameQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appName,

  appName,
  featureName,
});
