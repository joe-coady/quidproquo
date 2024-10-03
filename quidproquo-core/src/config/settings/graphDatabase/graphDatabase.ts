import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../../../qpqCoreUtils';
import { CrossModuleOwner } from '../../../types';
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../../QPQConfig';

export interface QPQConfigAdvancedGraphDatabaseSettings extends QPQConfigAdvancedSettings {
  owner?: CrossModuleOwner<'graphDatabaseName'>;
}

export interface GraphDatabaseQPQConfigSetting extends QPQConfigSetting {
  name: string;
  virualNetworkName: string;
}

export const defineGraphDatabase = (
  name: string,
  virualNetworkName: string,
  options?: QPQConfigAdvancedGraphDatabaseSettings,
): GraphDatabaseQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.graphDatabase,
  uniqueKey: name,

  name,
  virualNetworkName,

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
