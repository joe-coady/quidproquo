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
  buildPath: string;

  phoneRequired: boolean;

  selfSignUpEnabled: boolean;
}

export const defineUserDirectory = (
  name: string,
  buildPath: string,
  options?: QPQConfigAdvancedUserDirectorySettings,
): UserDirectoryQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.userDirectory,
  uniqueKey: name,

  name,
  buildPath,

  phoneRequired: options?.phoneRequired || false,

  selfSignUpEnabled: options?.selfSignUpEnabled || true,
});
