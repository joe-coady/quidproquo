import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface AppNameQPQConfigSetting extends QPQConfigSetting {
  appName: string;
  configRoot: string;
  featureName?: string;
  deployRegion?: string;
}

export const defineApplication = (
  appName: string,
  configRoot: string,
  featureName?: string,
  deployRegion?: string,
): AppNameQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appName,

  appName,
  configRoot,
  featureName,
  deployRegion,
});
