import {
  QPQConfig,
  QPQConfigSetting,
  QPQCoreConfigSettingType,
} from "./config/QPQConfig";
import { AppNameQPQConfigSetting } from "./config/settings/appName";

export const getConfigSettings = <T extends QPQConfigSetting>(
  configs: QPQConfig,
  configSettingType: string
): T[] => {
  return configs.filter(
    (c) => c.configSettingType === configSettingType
  ) as T[];
};

export const getConfigSetting = <T extends QPQConfigSetting>(
  configs: QPQConfig,
  serviceInfrastructureConfigType: string
): T | undefined => {
  const [setting] = getConfigSettings<T>(
    configs,
    serviceInfrastructureConfigType
  );
  return setting;
};

export const getAppName = (configs: QPQConfig): string => {
  const appName = getConfigSetting<AppNameQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.appName
  )?.appName;

  if (!appName) {
    throw new Error("please use defineAppName in your QPQ config");
  }

  return appName;
};

export default {
  getConfigSettings,
  getConfigSetting,
  getAppName,
};
