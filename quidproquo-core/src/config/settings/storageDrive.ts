import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface StorageDriveQPQConfigSetting extends QPQConfigSetting {
  storageDrive: string;
}

export const defineStorageDrive = (storageDrive: string): StorageDriveQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.storageDrive,
  uniqueKey: storageDrive,

  storageDrive,
});
