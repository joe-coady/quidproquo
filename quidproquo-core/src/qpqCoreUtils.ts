import { QPQConfig, QPQConfigSetting, QPQCoreConfigSettingType } from './config/QPQConfig';
import { AppNameQPQConfigSetting, StorageDriveQPQConfigSetting } from './config/settings';

export const getConfigSettings = <T extends QPQConfigSetting>(
  configs: QPQConfig,
  configSettingType: string,
): T[] => {
  return configs.filter((c) => c.configSettingType === configSettingType) as T[];
};

export const getConfigSetting = <T extends QPQConfigSetting>(
  configs: QPQConfig,
  serviceInfrastructureConfigType: string,
): T | undefined => {
  const [setting] = getConfigSettings<T>(configs, serviceInfrastructureConfigType);
  return setting;
};

export const getAppName = (configs: QPQConfig): string => {
  const appName = getConfigSetting<AppNameQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.appName,
  )?.appName;

  if (!appName) {
    throw new Error('please use defineAppName in your QPQ config');
  }

  return appName;
};

export const getStorageDriveNames = (configs: QPQConfig): string[] => {
  const storageDriveNames = getConfigSettings<StorageDriveQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.storageDrive,
  ).map((sd) => sd.storageDrive);

  return storageDriveNames;
};
