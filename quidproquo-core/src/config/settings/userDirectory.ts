import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

export interface QPQConfigAdvancedUserDirectorySettings extends QPQConfigAdvancedSettings {
  phoneRequired?: boolean;
  emailRequired?: boolean;
}

export interface UserDirectoryQPQConfigSetting extends QPQConfigSetting {
  name: string;

  phoneRequired: boolean;
  emailRequired: boolean;
}

export const defineUserDirectory = (
  name: string,
  options?: QPQConfigAdvancedUserDirectorySettings,
): UserDirectoryQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.userDirectory,
  uniqueKey: name,

  name,

  phoneRequired: options?.phoneRequired || false,
  emailRequired: options?.emailRequired || true,
});
