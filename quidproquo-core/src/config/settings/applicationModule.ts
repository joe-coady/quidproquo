import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface ApplicationModuleQPQConfigSetting extends QPQConfigSetting {
  applicationName: string;
  moduleName: string;
  configRoot: string;
  environment?: string;
  deployRegion?: string;
  feature?: string;
}

export const defineApplicationModule = (
  applicationName: string,
  moduleName: string,
  environment: string,
  configRoot: string,
  deployRegion?: string,
  feature?: string,
): ApplicationModuleQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appName,
  uniqueKey: `${applicationName}-${moduleName}`,

  applicationName,
  moduleName,
  configRoot,
  environment,
  deployRegion,
  feature,
});
