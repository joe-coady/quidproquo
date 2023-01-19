import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface AppNameQPQConfigSetting extends QPQConfigSetting {
  appName: string;
  featureName?: string;
  deployRegion?: string;
}

export const defineApplication = (
  appName: string,
  featureName?: string,
  deployRegion?: string,
): AppNameQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appName,

  appName,
  featureName,
  deployRegion,
});
