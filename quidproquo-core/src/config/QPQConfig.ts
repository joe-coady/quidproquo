export enum QPQCoreConfigSettingType {
  appName = '@quidproquo-core/config/AppName',
  storageDrive = '@quidproquo-core/config/storageDrive',
  schedule = '@quidproquo-core/config/schedule',
}

export interface QPQConfigSetting {
  configSettingType: string;
}

export type QPQConfig = QPQConfigSetting[];
