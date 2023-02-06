import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

export interface QPQConfigAdvancedStorageDriveSettings extends QPQConfigAdvancedSettings {
  copyPath?: string;
}

export interface StorageDriveQPQConfigSetting extends QPQConfigSetting {
  storageDrive: string;
  copyPath?: string;
}

export const defineStorageDrive = (
  storageDrive: string,
  options?: QPQConfigAdvancedStorageDriveSettings,
): StorageDriveQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.storageDrive,
  uniqueKey: storageDrive,

  storageDrive,

  copyPath: options?.copyPath,
});
