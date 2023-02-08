import { Construct } from 'constructs';

import {
  QPQCoreConfigSettingType,
  qpqCoreUtils,
  ParameterQPQConfigSetting,
  StorageDriveQPQConfigSetting,
  SecretQPQConfigSetting,
  QPQConfig,
  QueueQPQConfigSetting,
} from 'quidproquo-core';

import { ApiQPQWebServerConfigSetting, QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import {
  QpqResource,
  QpqCoreParameterConstruct,
  QpqCoreSecretConstruct,
  QpqCoreStorageDriveConstruct,
  QpqCoreQueueConstruct,
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

export const getQqpParameterGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
  awsAccountId: string,
): QpqResource[] => {
  const parameterSettings = [
    ...qpqCoreUtils.getConfigSettings<ParameterQPQConfigSetting>(
      qpqConfig,
      QPQCoreConfigSettingType.parameter,
    ),
  ];

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

export const serviceNeedsServiceHostedZone = (qpqConfig: QPQConfig) => {
  // We need it if we are deploying our api to a service domain
  const apiConfigs = qpqCoreUtils
    .getConfigSettings<ApiQPQWebServerConfigSetting>(qpqConfig, QPQWebServerConfigSettingType.Api)
    .filter((config) => !config.onRootDomain);

  // // Or if we are deploying to a feature env ~ like joecoady
  // const hasFeatureName = !!qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return apiConfigs.length > 0; // || hasFeatureName;
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
  ];
};
