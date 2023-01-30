import { Construct } from 'constructs';

import {
  QPQCoreConfigSettingType,
  qpqCoreUtils,
  ParameterQPQConfigSetting,
  StorageDriveQPQConfigSetting,
  SecretQPQConfigSetting,
  QPQConfig,
} from 'quidproquo-core';

import { ApiQPQWebServerConfigSetting, QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqResource } from './constructs/core/QpqResource';
import { QpqCoreParameterConstruct } from './constructs/QpqCoreParameterConstruct';
import { QpqCoreSecretConstruct } from './constructs/QpqCoreSecretConstruct';
import { QpqCoreStorageDriveConstruct } from './constructs/QpqCoreStorageDriveConstruct';

export const getResourceName = (name: string, qpqConfig: QPQConfig) => {
  const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);

  return `${name}-${service}-${environment}`;
};

export const getQqpSecretGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
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
    );
  });

  return secretResources;
};

export const getQqpParameterGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
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
    );
  });

  return parameterResources;
};

export const getQqpStorageDriveGrantables = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
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
    );
  });

  return storageDriveResources;
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
): QpqResource[] => {
  return [
    ...getQqpParameterGrantables(scope, id, qpqConfig),
    ...getQqpSecretGrantables(scope, id, qpqConfig),
    ...getQqpStorageDriveGrantables(scope, id, qpqConfig),
  ];
};
