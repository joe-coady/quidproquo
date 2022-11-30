export enum QPQCoreConfigSettingType {
  appName = "@quidproquo-core/config/AppName",
}

export interface QPQConfigSetting {
  configSettingType: string;
}

export type QPQConfig = QPQConfigSetting[];
