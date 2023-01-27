import * as path from 'path';

import { QPQConfig, QPQConfigSetting, QPQCoreConfigSettingType } from './config/QPQConfig';
import {
  AppNameQPQConfigSetting,
  BuildPathQPQConfigSetting,
  StorageDriveQPQConfigSetting,
  ScheduleQPQConfigSetting,
  SecretQPQConfigSetting,
  ParameterQPQConfigSetting,
  ActionProcessorsQPQConfigSetting,
} from './config/settings';

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
    throw new Error('please use defineApplication in your QPQ config');
  }

  return appName;
};

export const getApplicationEnvironment = (configs: QPQConfig): string => {
  const environment =
    getConfigSetting<AppNameQPQConfigSetting>(configs, QPQCoreConfigSettingType.appName)
      ?.environment || 'production';

  return environment;
};

export const getDeployRegion = (configs: QPQConfig): string => {
  const deployRegion =
    getConfigSetting<AppNameQPQConfigSetting>(configs, QPQCoreConfigSettingType.appName)
      ?.deployRegion || 'us-east-1';

  return deployRegion;
};

export const getConfigRoot = (configs: QPQConfig): string => {
  const configRoot = getConfigSetting<AppNameQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.appName,
  )?.configRoot;

  if (!configRoot) {
    throw new Error('please use defineApplication in your QPQ config');
  }

  return configRoot;
};

export const getStorageDriveNames = (configs: QPQConfig): string[] => {
  const storageDriveNames = getConfigSettings<StorageDriveQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.storageDrive,
  ).map((sd) => sd.storageDrive);

  return storageDriveNames;
};

export const getActionProcessorSources = (configs: QPQConfig): string[] => {
  const sources = getConfigSettings<ActionProcessorsQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.actionProcessors,
  ).map((ap) => ap.src);

  return sources;
};

export const getScheduleEvents = (configs: QPQConfig): ScheduleQPQConfigSetting[] => {
  const scheduleEvents = getConfigSettings<ScheduleQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.schedule,
  );

  return scheduleEvents;
};

// Used in bundlers to know where and what to build and index
export const getAllSrcEntries = (configs: QPQConfig): string[] => {
  return [...getScheduleEvents(configs).map((r) => r.src)];
};

export const getOwnedSecrets = (configs: QPQConfig): SecretQPQConfigSetting[] => {
  const secrets = getConfigSettings<SecretQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.secret,
  );

  return secrets.filter((s) => s.owned);
};

export const getOwnedParameters = (configs: QPQConfig): ParameterQPQConfigSetting[] => {
  const secrets = getConfigSettings<ParameterQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.parameter,
  );

  return secrets.filter((s) => s.owned);
};

export const getSharedSecrets = (configs: QPQConfig): SecretQPQConfigSetting[] => {
  const secrets = getConfigSettings<SecretQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.secret,
  );

  return secrets.filter((s) => !s.owned);
};

export const getBuildPath = (configs: QPQConfig): string => {
  const buildPath = getConfigSetting<BuildPathQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.buildPath,
  )?.buildPath;

  if (!buildPath) {
    throw new Error('please use defineBuildPath in your QPQ config');
  }

  return buildPath;
};

export const getUniqueKeyForSetting = (setting: QPQConfigSetting) => {
  const type = setting.configSettingType.split('/').pop();
  const key = setting.uniqueKey;

  return `${type}${key}`;
};

export const getScheduleEntryFullPath = (
  qpqConfig: QPQConfig,
  scheduleConfig: ScheduleQPQConfigSetting,
): string => {
  return path.join(getConfigRoot(qpqConfig), scheduleConfig.buildPath);
};
