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
}

export interface QPQConfigSetting {
  configSettingType: string;
  uniqueKey: string;
}

export interface QPQConfigAdvancedSettings {
  deprecated?: boolean;
}

export type QPQConfig = QPQConfigSetting[];
