import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface ParameterQPQConfigSetting extends QPQConfigSetting {
  key: string;
  value: string;
}

export const defineParameter = (key: string, value: string = ''): ParameterQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.parameter,
  uniqueKey: key,

  key,
  value
});
