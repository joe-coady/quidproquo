import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface EnvironmentSettingsQPQConfigSetting extends QPQConfigSetting {
  environment: string;

  settings: QPQConfigSetting[];
}

export const defineEnvironmentSettings = (
  environment: string,
  settings: QPQConfigSetting[],
): EnvironmentSettingsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.environmentSettings,
  uniqueKey: environment,

  environment,

  settings,
});
