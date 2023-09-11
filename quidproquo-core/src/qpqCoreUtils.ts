import * as path from 'path';

import {
  QPQConfig,
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigItem,
} from './config/QPQConfig';
import {
  ApplicationModuleQPQConfigSetting,
  StorageDriveQPQConfigSetting,
  EventBusQPQConfigSetting,
  ScheduleQPQConfigSetting,
  SecretQPQConfigSetting,
  ParameterQPQConfigSetting,
  QueueQPQConfigSetting,
  QpqQueueProcessors,
  ActionProcessorsQPQConfigSetting,
  UserDirectoryQPQConfigSetting,
  KeyValueStoreQPQConfigSetting,
  EnvironmentSettingsQPQConfigSetting,
  DeployEventsQPQConfigSetting
} from './config/settings';
import { EmailTemplates } from './config/settings/emailTemplates/types';
import { CrossServiceResourceName, ResourceName } from './types';

/**
 * Flattens a QPQConfig array into a single array of QPQConfigSetting objects.
 * If a QPQConfigItem has a configSettingType of QPQCoreConfigSettingType.environmentSettings,
 * and its environment matches the current environment, its settings will be added to the flattened array.
 * @function
 * @param {QPQConfig} qpqConfig - The input QPQConfig array to be flattened.
 * @returns {QPQConfigSetting[]} - The flattened array of QPQConfigSetting objects
 */
export const flattenQpqConfig = (qpqConfig: QPQConfig): QPQConfigSetting[] => {
  var environment = 'development';

  /**
   * A recursive helper function that flattens an array of QPQConfigItem objects.
   * @function
   * @param {QPQConfigItem[]} configItems - An array of QPQConfigItem objects to be flattened.
   * @param {QPQConfigSetting[]} accumulator - An accumulator array for storing the flattened QPQConfigSetting objects.
   * @returns {QPQConfigSetting[]} - The flattened array of QPQConfigSetting objects.
   */
  const flatten = (
    configItems: QPQConfigItem[],
    accumulator: QPQConfigSetting[] = [],
  ): QPQConfigSetting[] => {
    return configItems.reduce<QPQConfigSetting[]>((acc, item) => {
      if (Array.isArray(item)) {
        return flatten(item, acc);
      } else {
        // If its a appName config item, update the environment variable
        if (item.configSettingType === QPQCoreConfigSettingType.appName) {
          environment = (item as ApplicationModuleQPQConfigSetting).environment || 'development';
        }

        // Otherwise if its an environmentSettings config item, flatten out the child settings
        else if (item.configSettingType === QPQCoreConfigSettingType.environmentSettings) {
          const envSetting = item as EnvironmentSettingsQPQConfigSetting;
          const settings = envSetting.environment === environment ? envSetting.settings : [];

          return flatten(settings, acc);
        }

        // Otherwise its just a regular config item, add it to the list
        return [...acc, item];
      }
    }, accumulator);
  };

  return flatten(qpqConfig);
};

/**
 * Filters and returns the config settings of a specific type from a QPQConfig array.
 * @function
 * @template T - The specific type of QPQConfigSetting to filter.
 * @param {QPQConfig} qpqConfig - The input QPQConfig array.
 * @param {string} configSettingType - The specific config setting type to filter.
 * @returns {T[]} - An array of filtered config settings of the specified type.
 */
export const getConfigSettings = <T extends QPQConfigSetting>(
  qpqConfig: QPQConfig,
  configSettingType: string,
): T[] => {
  const flatConfig = flattenQpqConfig(qpqConfig);
  return flatConfig.filter((c) => c.configSettingType === configSettingType) as T[];
};

/**
 * Retrieves a single config setting of a specific type from a QPQConfig array.
 * @function
 * @template T - The specific type of QPQConfigSetting to retrieve.
 * @param {QPQConfig} qpqConfig - The input QPQConfig array.
 * @param {string} serviceInfrastructureConfigType - The specific config setting type to retrieve.
 * @returns {T | undefined} - The found config setting of the specified type or undefined if not found.
 */
export const getConfigSetting = <T extends QPQConfigSetting>(
  qpqConfig: QPQConfig,
  serviceInfrastructureConfigType: string,
): T | undefined => {
  const [setting] = getConfigSettings<T>(qpqConfig, serviceInfrastructureConfigType);
  return setting;
};

/**
 * Retrieves the ApplicationModuleSetting from a QPQConfig array.
 * @function
 * @param {QPQConfig} qpqConfig - The input QPQConfig array.
 * @returns {ApplicationModuleQPQConfigSetting} - The ApplicationModuleQPQConfigSetting from the QPQConfig array.
 * @throws {Error} - If the ApplicationModuleQPQConfigSetting is not found in the QPQConfig array.
 */
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

export const getAllEventBusConfigs = (qpqConfig: QPQConfig): EventBusQPQConfigSetting[] => {
  const eventBuses = getConfigSettings<EventBusQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.eventBus,
  );

  return eventBuses;
};

export const getOwnedItems = <T extends QPQConfigSetting>(
  settings: T[],
  qpqConfig: QPQConfig,
): T[] => {
  const appModuleName = getApplicationModuleName(qpqConfig);
  return settings.filter((s) => !s.owner || s.owner.module === appModuleName);
};

export const getAllKeyValueStores = (qpqConfig: QPQConfig): KeyValueStoreQPQConfigSetting[] => {
  const keyValueStores = getConfigSettings<KeyValueStoreQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.keyValueStore,
  );

  return keyValueStores;
};

export const getDeployEventConfigs = (qpqConfig: QPQConfig): DeployEventsQPQConfigSetting[] => {
  const deployEvents = getConfigSettings<DeployEventsQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.deployEvent,
  );

  return deployEvents;
};

export const getOwnedKeyValueStores = (qpqConfig: QPQConfig): KeyValueStoreQPQConfigSetting[] => {
  return getOwnedItems(getAllKeyValueStores(qpqConfig), qpqConfig);
};

export const resolveCrossServiceResourceName = (
  resourceName: ResourceName,
): CrossServiceResourceName => {
  if (typeof resourceName === 'string') {
    return {
      name: resourceName,
    };
  }

  return resourceName;
};

export const getKeyValueStoreByName = (
  qpqConfig: QPQConfig,
  kvsName: ResourceName,
): KeyValueStoreQPQConfigSetting | undefined => {
  const crossServiceResourceName = resolveCrossServiceResourceName(kvsName);
  const appModuleName = getApplicationModuleName(qpqConfig);

  const keyValueStore = getAllKeyValueStores(qpqConfig).find(
    (kvs) =>
      kvs.keyValueStoreName === crossServiceResourceName.name &&
      (!crossServiceResourceName.service || crossServiceResourceName.service === appModuleName),
  );

  return keyValueStore;
};

export const getActionProcessorSources = (configs: QPQConfig): string[] => {
  const sources = getConfigSettings<ActionProcessorsQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.actionProcessors,
  ).map((ap) => ap.src);

  return sources;
};

export const getUserDirectoryEmailTemplates = (
  qpqConfig: QPQConfig,
): Record<string, EmailTemplates> => {
  const userDirectories = getConfigSettings<UserDirectoryQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.userDirectory,
  );

  const record = userDirectories.reduce(
    (acc, ud) => ({
      ...acc,
      [ud.name]: ud.emailTemplates,
    }),
    {} as Record<string, EmailTemplates>,
  );

  return record;
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

export const getUserDirectorySrcEntries = (qpqConfig: QPQConfig): string[] => {
  const userConfigs = getUserDirectories(qpqConfig);

  return userConfigs.reduce(
    (acc, ud) => [...acc, ...Object.values(ud.emailTemplates).map((et) => et.src)],
    [] as string[],
  ).filter(src => !!src);
};



// Used in bundlers to know where and what to build and index
export const getAllSrcEntries = (qpqConfig: QPQConfig): string[] => {
  return [
    ...getScheduleEvents(qpqConfig).map((r) => r.src),
    ...getQueueSrcEntries(qpqConfig),
    ...getUserDirectorySrcEntries(qpqConfig),
  ];
};

export const getOwnedSecrets = (configs: QPQConfig): SecretQPQConfigSetting[] => {
  const secrets = getConfigSettings<SecretQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.secret,
  );

  return secrets.filter((s) => s.owned);
};

export const getUserDirectories = (configs: QPQConfig): UserDirectoryQPQConfigSetting[] => {
  const userDirectories = getConfigSettings<UserDirectoryQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.userDirectory,
  );

  return userDirectories;
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

export const getDeployEventFullPath = (
  qpqConfig: QPQConfig,
  deployEventConfig: DeployEventsQPQConfigSetting,
): string => {
  return path.join(getConfigRoot(qpqConfig), deployEventConfig.buildPath);
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

export const getUserDirectoryEntryFullPath = (
  qpqConfig: QPQConfig,
  userDirectoryConfig: UserDirectoryQPQConfigSetting,
): string => {
  return path.join(getConfigRoot(qpqConfig), userDirectoryConfig.buildPath);
};

export const getQueueQueueProcessors = (name: string, qpqConfig: QPQConfig): QpqQueueProcessors => {
  const seoConfigs = getConfigSettings<QueueQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.queue,
  );

  const queueConfig = seoConfigs.find((c) => c.name === name);

  return queueConfig?.qpqQueueProcessors || {};
};
