import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface ApplicationBasePathQPQConfigSetting extends QPQConfigSetting {
  basePath: string;
}

export const defineApplicationBasePath = (basePath: string): ApplicationBasePathQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appBasePath,

  // There can be only one base path
  uniqueKey: 'Base_Path',

  basePath,
});
