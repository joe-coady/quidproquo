import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface SecretQPQConfigSetting extends QPQConfigSetting {
  key: string;
  value: string;
  owned: boolean;
}

export const defineSecret = (
  key: string,
  owned: boolean = true,
  value: string = '',
): SecretQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.secret,

  key,
  value,
  owned,
});
