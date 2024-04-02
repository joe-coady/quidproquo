import { Construct, IConstruct } from 'constructs';

import * as cdk from 'aws-cdk-lib';

import {
  QPQCoreConfigSettingType,
  qpqCoreUtils,
  ParameterQPQConfigSetting,
  StorageDriveQPQConfigSetting,
  SecretQPQConfigSetting,
  QPQConfig,
  QueueQPQConfigSetting,
} from 'quidproquo-core';

import {
  ApiQPQWebServerConfigSetting,
  QPQWebServerConfigSettingType,
  qpqWebServerUtils,
  WebEntryQPQWebServerConfigSetting,
} from 'quidproquo-webserver';

import {
  QpqResource,
  QpqCoreParameterConstruct,
  QpqCoreSecretConstruct,
  QpqCoreStorageDriveConstruct,
  QpqCoreQueueConstruct,
  QpqCoreUserDirectoryConstruct,
  QpqCoreEventBusConstruct,
  QpqCoreKeyValueStoreConstruct,
} from '../constructs';

export const getQqpSecretGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const secretSettings = [
    ...qpqCoreUtils.getConfigSettings<SecretQPQConfigSetting>(
      qpqConfig,
      QPQCoreConfigSettingType.secret,
    ),
  ];

  const secretResources = secretSettings.map((secretSetting) => {
    return QpqCoreSecretConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(secretSetting)}-grantable`,
      qpqConfig,
      secretSetting,
      awsAccountId,
    );
  });

  return secretResources;
};

export const getQqpKvsGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const kvsSettings = [...qpqCoreUtils.getAllKeyValueStores(qpqConfig)];

  const kvsResources = kvsSettings.map((kvsSetting) => {
    return QpqCoreKeyValueStoreConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(kvsSetting)}-grantable`,
      qpqConfig,
      awsAccountId,
      kvsSetting.keyValueStoreName,
    );
  });

  return kvsResources;
};

export const getQqpParameterGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const parameterSettings = qpqCoreUtils.getAllParameterConfigs(qpqConfig);

  const parameterResources = parameterSettings.map((parameterSetting) => {
    return QpqCoreParameterConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(parameterSetting)}-grantable`,
      qpqConfig,
      parameterSetting,
      awsAccountId,
    );
  });

  return parameterResources;
};

export const getQqpStorageDriveGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const storageDriveSettings = [
    ...qpqCoreUtils.getConfigSettings<StorageDriveQPQConfigSetting>(
      qpqConfig,
      QPQCoreConfigSettingType.storageDrive,
    ),
  ];

  const storageDriveResources = storageDriveSettings.map((storageDriveSetting) => {
    return QpqCoreStorageDriveConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(storageDriveSetting)}-grantable`,
      qpqConfig,
      storageDriveSetting,
      awsAccountId,
    );
  });

  return storageDriveResources;
};

export const getQqpQueueGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const queueSettings = [
    ...qpqCoreUtils.getConfigSettings<QueueQPQConfigSetting>(
      qpqConfig,
      QPQCoreConfigSettingType.queue,
    ),
  ];

  const queueResources = queueSettings.map((queueSetting) => {
    return QpqCoreQueueConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(queueSetting)}-grantable`,
      qpqConfig,
      queueSetting,
      awsAccountId,
    );
  });

  return queueResources;
};

export const getQqpUserPoolGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const userDirectoryConfigs = qpqCoreUtils.getUserDirectories(qpqConfig);

  const userDirectoryResources = userDirectoryConfigs.map((userDirectoryConfig) => {
    return QpqCoreUserDirectoryConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(userDirectoryConfig)}-grantable`,
      qpqConfig,
      awsAccountId,
      userDirectoryConfig.name,
    );
  });

  return userDirectoryResources;
};

export const getQqpTopicGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const eventBusConfigs = qpqCoreUtils
    .getAllEventBusConfigs(qpqConfig)
    .filter((ebc) => !ebc.deprecated);

  const eventBuses = eventBusConfigs.map((eventBus) => {
    return QpqCoreEventBusConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(eventBus)}-grantable`,
      qpqConfig,
      awsAccountId,
      eventBus.name,
    );
  });

  return eventBuses;
};

export const getQqpUserPoolGrantablesForApiConfig = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
  config: ApiQPQWebServerConfigSetting,
): QpqResource[] => {
  const routesWithAuth = qpqWebServerUtils
    .getAllRoutesForApi(config.apiName, qpqConfig)
    .filter(
      (r) =>
        r.options.routeAuthSettings?.userDirectoryName &&
        (r.options.routeAuthSettings?.applicationName || r.options.routeAuthSettings?.serviceName),
    );

  const userDirectoryResources = routesWithAuth.map((route) => {
    return QpqCoreUserDirectoryConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(route)}-grantable-xserver`,
      qpqConfig,
      awsAccountId,
      route.options.routeAuthSettings?.userDirectoryName!,
      route.options.routeAuthSettings?.serviceName,
      route.options.routeAuthSettings?.applicationName,
    );
  });

  return userDirectoryResources;
};

// Get resources that we can use to grant permissions to lambdas etc
export const getQqpGrantableResources = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  return [
    ...getQqpParameterGrantables(scope, id, qpqConfig, awsAccountId),
    ...getQqpSecretGrantables(scope, id, qpqConfig, awsAccountId),
    ...getQqpStorageDriveGrantables(scope, id, qpqConfig, awsAccountId),
    ...getQqpQueueGrantables(scope, id, qpqConfig, awsAccountId),
    ...getQqpUserPoolGrantables(scope, id, qpqConfig, awsAccountId),
    ...getQqpTopicGrantables(scope, id, qpqConfig, awsAccountId),
    ...getQqpKvsGrantables(scope, id, qpqConfig, awsAccountId),
  ];
};

export const getQqpGrantableResourcesForApiConfig = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
  config: ApiQPQWebServerConfigSetting,
): QpqResource[] => {
  return [
    // All the normal grantables
    ...getQqpGrantableResources(scope, id, qpqConfig, awsAccountId),

    // Then special grantables just for this config.
    ...getQqpUserPoolGrantablesForApiConfig(scope, id, qpqConfig, awsAccountId, config),
  ];
};

export const exportStackValue = (
  scope: Construct,
  uniqueKey: string,
  value: string,
): cdk.CfnOutput => {
  return new cdk.CfnOutput(scope, uniqueKey, {
    exportName: uniqueKey,
    value,
  });
};

export const importStackValue = (uniqueKey: string): string => {
  return cdk.Fn.importValue(uniqueKey);
};

export const applyEnvironmentTags = (scope: IConstruct, qpqConfig: QPQConfig) => {
  cdk.Tags.of(scope).add('environment', qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig));
  cdk.Tags.of(scope).add('application', qpqCoreUtils.getApplicationName(qpqConfig));
  cdk.Tags.of(scope).add('module', qpqCoreUtils.getApplicationModuleName(qpqConfig));

  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);
  if (feature) {
    cdk.Tags.of(scope).add('feature', feature);
  }
};
