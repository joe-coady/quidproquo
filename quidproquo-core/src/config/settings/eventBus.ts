import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

export interface QPQConfigAdvancedEventBusSettings extends QPQConfigAdvancedSettings {}

export interface EventBusQPQConfigSetting extends QPQConfigSetting {
  name: string;

  deprecated?: boolean;
}

export const defineEventBus = (
  name: string,
  options?: QPQConfigAdvancedEventBusSettings,
): EventBusQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.eventBus,
  uniqueKey: name,

  name,

  deprecated: !!options?.deprecated,
});
