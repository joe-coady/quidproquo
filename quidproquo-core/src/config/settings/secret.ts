import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface SecretQPQConfigSetting extends QPQConfigSetting {
  key: string;
  value: string;
}

export const defineSecret = (key: string, value: string): SecretQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.secret,

  key,
  value,
});
