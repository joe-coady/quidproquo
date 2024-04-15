import * as path from 'path';

import {
  QPQConfig,
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigItem,
} from './config/QPQConfig';
import {
  ApplicationQPQConfigSetting,
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
  DeployEventsQPQConfigSetting,
  GlobalQPQConfigSetting,
  ModuleQPQConfigSetting,
  ClaudeAIQPQConfigSetting,
} from './config/settings';
import {
  EmailTemplates,
  QpqEmailTemplateSourceEntry,
} from './config/settings/emailTemplates/types';
import {
  CrossModuleOwner,
  CrossServiceResourceName,
  CustomFullyQualifiedResource,
  FullyQualifiedResource,
  ResourceName,
  KeyOf,
} from './types';

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
          environment = (item as ApplicationQPQConfigSetting).environment || 'development';
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
 * @returns {ApplicationQPQConfigSetting} - The ApplicationQPQConfigSetting from the QPQConfig array.
 * @throws {Error} - If the ApplicationQPQConfigSetting is not found in the QPQConfig array.
 */
export const getApplicationConfigSetting = (qpqConfig: QPQConfig): ApplicationQPQConfigSetting => {
  const applicationModuleSetting = getConfigSetting<ApplicationQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.appName,
  );

  if (!applicationModuleSetting) {
    throw new Error('please use defineApplication in your QPQ config');
  }

  return applicationModuleSetting;
};

export const getApplicationModuleName = (qpqConfig: QPQConfig): string => {
  const moduleSetting = getConfigSetting<ModuleQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.moduleName,
  );

  if (!moduleSetting) {
    throw new Error('please use defineModule in your QPQ config');
  }

  return moduleSetting.moduleName;
};

export const getApplicationName = (qpqConfig: QPQConfig): string => {
  return getApplicationConfigSetting(qpqConfig).applicationName;
};

export const getApplicationModuleFeature = (qpqConfig: QPQConfig): string | undefined => {
  return getApplicationConfigSetting(qpqConfig).feature;
};

export const getConfigRoot = (qpqConfig: QPQConfig): string => {
  return getApplicationConfigSetting(qpqConfig).configRoot;
};

export const getApplicationModuleEnvironment = (qpqConfig: QPQConfig): string => {
  return getApplicationConfigSetting(qpqConfig).environment || 'production';
};

export const getApplicationModuleDeployRegion = (qpqConfig: QPQConfig): string => {
  return getApplicationConfigSetting(qpqConfig).deployRegion || 'us-east-1';
};

export const getStorageDrives = (configs: QPQConfig): StorageDriveQPQConfigSetting[] => {
  return getConfigSettings<StorageDriveQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.storageDrive,
  );
};

export const getStorageDriveByName = (
  storageDriveName: string,
  configs: QPQConfig,
): StorageDriveQPQConfigSetting | undefined => {
  return getStorageDrives(configs).find((sd) => sd.storageDrive === storageDriveName);
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

export const getAllClaudeAiConfigs = (qpqConfig: QPQConfig): ClaudeAIQPQConfigSetting[] => {
  const claudeAis = getConfigSettings<ClaudeAIQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.claudeAi,
  );

  return claudeAis;
};

export const getOwnedEventBusConfigs = (qpqConfig: QPQConfig): EventBusQPQConfigSetting[] => {
  const ownedEventBusConfigs = getOwnedItems(getAllEventBusConfigs(qpqConfig), qpqConfig);

  return ownedEventBusConfigs;
};

export const getEventBusConfigByName = (
  eventBusName: string,
  qpqConfig: QPQConfig,
): EventBusQPQConfigSetting | undefined => {
  const eventBusConfig = getAllEventBusConfigs(qpqConfig).find((eb) => eb.name === eventBusName);
  return eventBusConfig;
};

export const getOwnedItems = <T extends QPQConfigSetting>(
  settings: T[],
  qpqConfig: QPQConfig,
): T[] => {
  const appModuleName = getApplicationModuleName(qpqConfig);
  const appName = getApplicationName(qpqConfig);
  const appFeature = getApplicationModuleFeature(qpqConfig);
  const appEnvironment = getApplicationModuleEnvironment(qpqConfig);

  return settings.filter(
    (s) =>
      !s.owner ||
      ((!s.owner.module || s.owner.module === appModuleName) &&
        (!s.owner.application || s.owner.application === appName) &&
        (s.owner.feature === undefined ||
          (!s.owner.feature && !appFeature) ||
          s.owner.feature === appFeature) &&
        (!s.owner.environment || s.owner.environment === appEnvironment)),
  );
};

export const getAllKeyValueStores = <T extends object = any>(
  qpqConfig: QPQConfig,
): KeyValueStoreQPQConfigSetting<T>[] => {
  const keyValueStores = getConfigSettings<KeyValueStoreQPQConfigSetting<T>>(
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

export const getOwnedKeyValueStores = <T extends object = any>(
  qpqConfig: QPQConfig,
): KeyValueStoreQPQConfigSetting<T>[] => {
  return getOwnedItems(getAllKeyValueStores(qpqConfig), qpqConfig);
};

export const getOwnedStorageDrives = (qpqConfig: QPQConfig): StorageDriveQPQConfigSetting[] => {
  return getOwnedItems(getStorageDrives(qpqConfig), qpqConfig);
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

export const getKeyValueStoreByName = <T extends object = any>(
  qpqConfig: QPQConfig,
  kvsName: string,
): KeyValueStoreQPQConfigSetting<T> | undefined => {
  const keyValueStore = getAllKeyValueStores<T>(qpqConfig).find(
    (kvs) => kvs.keyValueStoreName === kvsName,
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
  // We just want the ones this service owns.
  const userConfigs = getOwnedUserDirectories(qpqConfig);

  return userConfigs
    .reduce(
      (acc, ud) => [
        ...acc,
        ...Object.values(ud.emailTemplates).map((et: QpqEmailTemplateSourceEntry) => et?.src),
      ],
      [] as string[],
    )
    .filter((src) => !!src);
};

// Used in bundlers to know where and what to build and index
export const getAllSrcEntries = (qpqConfig: QPQConfig): string[] => {
  return [
    ...getScheduleEvents(qpqConfig).map((r) => r.src),
    ...getQueueSrcEntries(qpqConfig),
    ...getUserDirectorySrcEntries(qpqConfig),
    ...getDeployEventConfigs(qpqConfig).map((r) => r.src.src),
    ...(getStorageDrives(qpqConfig)
      .flatMap((sd) => [sd.onEvent?.create?.src, sd.onEvent?.delete?.src])
      .filter((src) => !!src) as string[]),
  ];
};

export const getSecretByName = (
  secretName: string,
  qpqConfig: QPQConfig,
): SecretQPQConfigSetting => {
  const secrets = getConfigSettings<SecretQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.secret,
  );

  const secret = secrets.find((s) => s.key === secretName);

  if (!secret) {
    throw new Error(`Can not find secret [${secretName}]`);
  }

  return secret;
};

export const getAllSecretConfigs = (qpqConfig: QPQConfig): SecretQPQConfigSetting[] => {
  const secrets = getConfigSettings<SecretQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.secret,
  );

  return secrets;
};

export const getOwnedSecrets = (qpqConfig: QPQConfig): SecretQPQConfigSetting[] => {
  const secrets = getAllSecretConfigs(qpqConfig);

  return getOwnedItems(secrets, qpqConfig);
};

export const getGlobalConfigValue = <T>(qpqConfig: QPQConfig, name: string): T => {
  const global = getConfigSettings<GlobalQPQConfigSetting<T>>(
    qpqConfig,
    QPQCoreConfigSettingType.global,
  ).find((g) => g.key === name);

  if (!global) {
    throw new Error(`Global config ${name} not found`);
  }

  return global.value;
};

export const getUserDirectories = (configs: QPQConfig): UserDirectoryQPQConfigSetting[] => {
  const userDirectories = getConfigSettings<UserDirectoryQPQConfigSetting>(
    configs,
    QPQCoreConfigSettingType.userDirectory,
  );

  return userDirectories;
};

export const getOwnedUserDirectories = (qpqConifg: QPQConfig): UserDirectoryQPQConfigSetting[] => {
  const userDirectories = getUserDirectories(qpqConifg);

  return getOwnedItems(userDirectories, qpqConifg);
};

export const getUserDirectoryByName = (
  userDirectoryName: string,
  qpqConifg: QPQConfig,
): UserDirectoryQPQConfigSetting => {
  const userDirectory = getUserDirectories(qpqConifg).find((ud) => ud.name === userDirectoryName);

  if (!userDirectory) {
    throw new Error(`UserDirectory not found: ${userDirectoryName}`);
  }

  return userDirectory;
};

export const getAllParameterConfigs = (qpqConfig: QPQConfig): ParameterQPQConfigSetting[] => {
  const parameters = getConfigSettings<ParameterQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.parameter,
  );

  return parameters;
};

export const getParameterConfig = (
  name: string,
  qpqConfig: QPQConfig,
): ParameterQPQConfigSetting => {
  const parameters = getConfigSettings<ParameterQPQConfigSetting>(
    qpqConfig,
    QPQCoreConfigSettingType.parameter,
  );

  const param = parameters.find((p) => p.key === name);

  if (!param) {
    throw new Error(`Parameter ${name} not found`);
  }

  return param;
};

export const getOwnedParameterConfigs = (qpqConfig: QPQConfig): ParameterQPQConfigSetting[] => {
  const parameters = getAllParameterConfigs(qpqConfig);

  return getOwnedItems(parameters, qpqConfig);
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

export const getStorageDriveEntryFullPath = (
  qpqConfig: QPQConfig,
  storageDriveConfig: StorageDriveQPQConfigSetting,
): string => {
  if (!storageDriveConfig.onEvent?.buildPath) {
    throw new Error('Please specify a build path in your storage drive config (onEvent)');
  }

  return path.join(getConfigRoot(qpqConfig), storageDriveConfig.onEvent.buildPath);
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

export const convertCrossModuleOwnerToGenericResourceNameOverride = <T extends string>(
  owner?: CrossModuleOwner<T>,
): CrossModuleOwner<'resourceNameOverride'> | undefined => {
  if (!owner) {
    return undefined;
  }

  type KeyType = keyof typeof owner;
  const key: KeyType = Array.from(Object.keys(owner)).find(
    (k) => k !== 'module' && k !== 'application' && k !== 'feature' && k !== 'environment',
  ) as any as KeyType;

  const resourceName = owner[key as T];
  const { [key]: _, ...otherProps } = owner;

  return {
    ...otherProps,
    resourceNameOverride: resourceName,
  };
};

export const convertCustomFullyQualifiedResourceToGeneric = <T extends string>(
  resource: CustomFullyQualifiedResource<T>,
): FullyQualifiedResource => {
  type KeyType = KeyOf<CustomFullyQualifiedResource<T>>;
  const key: KeyType = Array.from(Object.keys(resource)).find(
    (k) => k !== 'module' && k !== 'application' && k !== 'feature' && k !== 'environment',
  ) as any as KeyType;

  const resourceName = resource[key as T];

  return {
    module: resource.module,
    application: resource.application,
    feature: resource.feature,
    environment: resource.environment,
    resourceName: resourceName,
  };
};

export const getFullyQualifiedResourceName = (
  qpqConfig: QPQConfig,
  resourceName: string,
  config?: QPQConfigSetting,
): FullyQualifiedResource => {
  const confApplication = getApplicationName(qpqConfig);
  const confEnvironment = getApplicationModuleEnvironment(qpqConfig);
  const confFeature = getApplicationModuleFeature(qpqConfig);
  const confModule = getApplicationModuleName(qpqConfig);

  return {
    resourceName: config?.owner?.resourceNameOverride || resourceName,

    application: config?.owner?.application || confApplication,
    environment: config?.owner?.environment || confEnvironment,
    module: config?.owner?.module || confModule,
    feature: config?.owner?.feature || confFeature || '',
  };
};

// Fully Qualified Resource Names
export const getKeyValueStoreFullyQualifiedResourceName = (
  kvsName: string,
  qpqConfig: QPQConfig,
): FullyQualifiedResource => {
  const storeConfig = getKeyValueStoreByName(qpqConfig, kvsName);

  return getFullyQualifiedResourceName(qpqConfig, kvsName, storeConfig);
};

export const isSameResource = (
  resourceA: FullyQualifiedResource,
  resourceB: FullyQualifiedResource,
): boolean => {
  return (
    resourceA.application === resourceB.application &&
    resourceA.environment === resourceB.environment &&
    resourceA.feature === resourceB.feature &&
    resourceA.module === resourceB.module &&
    resourceA.resourceName === resourceB.resourceName
  );
};
