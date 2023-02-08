import * as path from 'path';

import { QPQConfig, QPQConfigSetting, QPQCoreConfigSettingType } from './config/QPQConfig';
import {
  ApplicationModuleQPQConfigSetting,
  BuildPathQPQConfigSetting,
  StorageDriveQPQConfigSetting,
  ScheduleQPQConfigSetting,
  SecretQPQConfigSetting,
  ParameterQPQConfigSetting,
  QueueQPQConfigSetting,
  QpqQueueProcessors,
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

export const getApplicationModuleSetting = (
  qpqConfig: QPQConfig,
): ApplicationModuleQPQConfigSetting => {
  const applicationModuleSetting = getConfigSetting<ApplicationModuleQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.appName,
  );

  if (!applicationModuleSetting) {
    throw new Error('please use defineApplicationModule in your QPQ config');
  }

  return applicationModuleSetting;
};

export const getApplicationName = (qpqConfig: QPQConfig): string => {
  return getApplicationModuleSetting(qpqConfig).applicationName;
};

export const getApplicationModuleName = (qpqConfig: QPQConfig): string => {
  return getApplicationModuleSetting(qpqConfig).moduleName;
};

export const getApplicationModuleFeature = (qpqConfig: QPQConfig): string | undefined => {
  return getApplicationModuleSetting(qpqConfig).feature;
};

export const getConfigRoot = (qpqConfig: QPQConfig): string => {
  return getApplicationModuleSetting(qpqConfig).configRoot;
};

export const getApplicationModuleEnvironment = (qpqConfig: QPQConfig): string => {
  return getApplicationModuleSetting(qpqConfig).environment || 'production';
};

export const getApplicationModuleDeployRegion = (qpqConfig: QPQConfig): string => {
  return getApplicationModuleSetting(qpqConfig).deployRegion || 'us-east-1';
};

export const getStorageDrives = (configs: QPQConfig): StorageDriveQPQConfigSetting[] => {
  return getConfigSettings<StorageDriveQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.storageDrive,
  );
};

export const getQueues = (configs: QPQConfig): QueueQPQConfigSetting[] => {
  return getConfigSettings<QueueQPQConfigSetting>(configs, QPQCoreConfigSettingType.queue);
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
  return getConfigSettings<ScheduleQPQConfigSetting>(configs, QPQCoreConfigSettingType.schedule);
};

export const getQueueSrcEntries = (configs: QPQConfig): string[] => {
  const queueConfigs = getConfigSettings<QueueQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.queue,
  );

  return queueConfigs.reduce(
    (acc, qc) => [...acc, ...Object.values(qc.qpqQueueProcessors).map((q) => q.src)],
    [] as string[],
  );
};

// Used in bundlers to know where and what to build and index
export const getAllSrcEntries = (qpqConfig: QPQConfig): string[] => {
  return [...getScheduleEvents(qpqConfig).map((r) => r.src), ...getQueueSrcEntries(qpqConfig)];
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

export const getStorageDriveUploadFullPath = (
  qpqConfig: QPQConfig,
  storageDriveConfig: StorageDriveQPQConfigSetting,
): string => {
  return path.join(getConfigRoot(qpqConfig), storageDriveConfig.copyPath || '');
};

export const getQueueEntryFullPath = (
  qpqConfig: QPQConfig,
  queueConfig: QueueQPQConfigSetting,
): string => {
  return path.join(getConfigRoot(qpqConfig), queueConfig.buildPath);
};

export const getQueueQueueProcessors = (name: string, qpqConfig: QPQConfig): QpqQueueProcessors => {
  const seoConfigs = getConfigSettings<QueueQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.queue,
  );

  const queueConfig = seoConfigs.find((c) => c.name === name);

  return queueConfig?.qpqQueueProcessors || {};
};
