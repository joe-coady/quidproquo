import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

export interface QPQConfigAdvancedKeyValueStoreSettings extends QPQConfigAdvancedSettings {}

export interface KeyValueStoreQPQConfigSetting extends QPQConfigSetting {
  keyValueStoreName: string;
}

export const defineKeyValueStore = (
  keyValueStoreName: string,
  options?: QPQConfigAdvancedKeyValueStoreSettings,
): KeyValueStoreQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.keyValueStore,
  uniqueKey: keyValueStoreName,

  keyValueStoreName,
});
