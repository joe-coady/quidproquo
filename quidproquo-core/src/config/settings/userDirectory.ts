import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

export interface QPQConfigAdvancedUserDirectorySettings extends QPQConfigAdvancedSettings {
  phoneRequired?: boolean;

  selfSignUpEnabled?: boolean;
}

export interface UserDirectoryQPQConfigSetting extends QPQConfigSetting {
  name: string;

  phoneRequired: boolean;

  selfSignUpEnabled: boolean;
}

export const defineUserDirectory = (
  name: string,
  options?: QPQConfigAdvancedUserDirectorySettings,
): UserDirectoryQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.userDirectory,
  uniqueKey: name,

  name,

  phoneRequired: options?.phoneRequired || false,

  selfSignUpEnabled: options?.selfSignUpEnabled || true,
});
