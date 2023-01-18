export enum QPQCoreConfigSettingType {
  appName = '@quidproquo-core/config/AppName',
  storageDrive = '@quidproquo-core/config/storageDrive',
  schedule = '@quidproquo-core/config/schedule',
  secret = '@quidproquo-core/config/secret',
  parameter = '@quidproquo-core/config/parameter',
  actionProcessors = '@quidproquo-core/config/actionProcessors',
}

export interface QPQConfigSetting {
  configSettingType: string;
}

export type QPQConfig = QPQConfigSetting[];
