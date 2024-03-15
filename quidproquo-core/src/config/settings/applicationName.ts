import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface ApplicationQPQConfigSetting extends QPQConfigSetting {
  applicationName: string;
  configRoot: string;
  environment?: string;
  deployRegion?: string;
  feature?: string;
}

export const defineApplication = (
  applicationName: string,
  environment: string,
  configRoot: string,
  deployRegion?: string,
  feature?: string,
): ApplicationQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appName,
  uniqueKey: applicationName,

  applicationName,
  configRoot,
  environment,
  deployRegion,
  feature,
});
