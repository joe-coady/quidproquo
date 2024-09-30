import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../../qpqCoreUtils';
import { CrossModuleOwner } from '../../types';
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedGraphDatabaseSettings extends QPQConfigAdvancedSettings {
  owner?: CrossModuleOwner<'graphDatabaseName'>;
}

export interface GraphDatabaseQPQConfigSetting extends QPQConfigSetting {
  name: string;
}

export const defineGraphDatabase = (name: string, options?: QPQConfigAdvancedGraphDatabaseSettings): GraphDatabaseQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.graphDatabase,
  uniqueKey: name,

  name,

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
