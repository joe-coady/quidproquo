import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../../qpqCoreUtils';
import { CrossModuleOwner } from '../../types';
import { QPQConfigAdvancedSettings,QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedEventBusSettings extends QPQConfigAdvancedSettings {
  owner?: CrossModuleOwner<'eventBusName'>;
}

export interface EventBusQPQConfigSetting extends QPQConfigSetting {
  name: string;

  deprecated?: boolean;

  owner?: CrossModuleOwner;
}

export const defineEventBus = (name: string, options?: QPQConfigAdvancedEventBusSettings): EventBusQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.eventBus,
  uniqueKey: name,

  name,

  deprecated: !!options?.deprecated,

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
