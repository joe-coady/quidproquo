import { QPQConfigSetting, QPQCoreConfigSettingType } from "../QPQConfig";

export interface AppNameQPQConfigSetting extends QPQConfigSetting {
  appName: string;
}

export const defineAppName = (appName: string): AppNameQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.appName,

  appName,
});
