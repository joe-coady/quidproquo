import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface AppNameQPQConfigSetting extends QPQConfigSetting {
  appName: string;
  configRoot: string;
  environment?: string;
  deployRegion?: string;
  feature?: string;
}

export const defineApplication = (
  appName: string,
  environment: string,
  configRoot: string,
  deployRegion?: string,
  feature?: string,
): AppNameQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appName,
  uniqueKey: appName,

  appName,
  configRoot,
  environment,
  deployRegion,
  feature,
});
