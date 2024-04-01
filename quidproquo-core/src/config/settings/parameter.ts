import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../../qpqCoreUtils';
import { CrossModuleOwner } from '../../types';
import {
  QPQConfigAdvancedSettings,
  QPQConfigSetting,
  QPQCoreConfigSettingType,
} from '../QPQConfig';

export interface QPQConfigAdvancedParameterSettings extends QPQConfigAdvancedSettings {
  owner?: CrossModuleOwner<'parameterName'>;
  value?: string;
}

export interface ParameterQPQConfigSetting extends QPQConfigSetting {
  key: string;
  value: string;
}

export const defineParameter = (
  key: string,
  options?: QPQConfigAdvancedParameterSettings,
): ParameterQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.parameter,
  uniqueKey: key,

  key,
  value: options?.value || '',

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
