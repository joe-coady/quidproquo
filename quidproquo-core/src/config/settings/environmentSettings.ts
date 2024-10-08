import { QPQConfig, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface EnvironmentSettingsQPQConfigSetting extends QPQConfigSetting {
  environment: string;

  settings: QPQConfig;
}

export const defineEnvironmentSettings = (environment: string, settings: QPQConfig): EnvironmentSettingsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.environmentSettings,
  uniqueKey: environment,

  environment,

  settings,
});
