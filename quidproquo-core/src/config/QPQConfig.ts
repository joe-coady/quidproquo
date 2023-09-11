import { CrossModuleOwner } from '../types';

export enum QPQCoreConfigSettingType {
  appName = '@quidproquo-core/config/AppName',
  storageDrive = '@quidproquo-core/config/storageDrive',
  schedule = '@quidproquo-core/config/schedule',
  secret = '@quidproquo-core/config/secret',
  parameter = '@quidproquo-core/config/parameter',
  actionProcessors = '@quidproquo-core/config/actionProcessors',
  buildPath = '@quidproquo-core/config/buildPath',
  queue = '@quidproquo-core/config/Queue',
  eventBus = '@quidproquo-core/config/EventBus',
  userDirectory = '@quidproquo-core/config/UserDirectory',
  keyValueStore = '@quidproquo-core/config/KeyValueStore',
  configValue = '@quidproquo-core/config/ConfigValue',
  environmentSettings = '@quidproquo-core/config/EnvironmentSettings',
  deployEvent = '@quidproquo-core/config/DeployEvent',
}

export interface QPQConfigSetting {
  configSettingType: string;
  uniqueKey: string;

  owner?: CrossModuleOwner;
}

export interface QPQConfigAdvancedSettings {
  deprecated?: boolean;
}

export type QPQConfigItem = QPQConfigSetting | QPQConfigItem[];
export type QPQConfig = QPQConfigItem[];
