import path from 'path';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { ServiceAccountInfo, LocalServiceAccountInfo, ApiLayer } from '../types';

import {
  AwsAlarmQPQConfigSetting,
  AwsDyanmoOverrideForKvsQPQConfigSetting,
  AwsServiceAccountInfoQPQConfigSetting,
  QPQAwsConfigSettingType,
} from '../config';

export const getAwsServiceAccountInfoConfig = (
  qpqConfig: QPQConfig,
): AwsServiceAccountInfoQPQConfigSetting => {
  const serviceAccountInfos = qpqCoreUtils.getConfigSettings<AwsServiceAccountInfoQPQConfigSetting>(
    qpqConfig,
    QPQAwsConfigSettingType.awsServiceAccountInfo,
  );

  if (serviceAccountInfos.length === 0) {
    console.log(JSON.stringify(qpqConfig, null, 2));
    throw new Error('use defineAwsServiceAccountInfo to define aws deployment config');
  }

  if (serviceAccountInfos.length > 1) {
    throw new Error('max one entry of defineAwsServiceAccountInfo can be used');
  }

  return serviceAccountInfos[0];
};

export const getAwsServiceAccountInfos = (qpqConfig: QPQConfig): ServiceAccountInfo[] => {
  const awsServiceAccountInfoConfig = getAwsServiceAccountInfoConfig(qpqConfig);

  const serviceInfos = [
    ...awsServiceAccountInfoConfig.serviceInfoMap,
    getLocalServiceAccountInfo(qpqConfig),
  ];

  const uniqueServices = serviceInfos.filter(
    (service, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.moduleName === service.moduleName &&
          t.applicationName === service.applicationName &&
          t.environment === service.environment &&
          t.feature === service.feature,
      ),
  );

  return uniqueServices;
};

export const getOwnedAwsAlarmConfigs = (qpqConfig: QPQConfig): AwsAlarmQPQConfigSetting[] => {
  const alarmConfigs = qpqCoreUtils.getConfigSettings<AwsAlarmQPQConfigSetting>(
    qpqConfig,
    QPQAwsConfigSettingType.awsServiceAlarm,
  );

  return qpqCoreUtils.getOwnedItems(alarmConfigs, qpqConfig);
};

export const getAwsAccountIds = (qpqConfig: QPQConfig): string[] => {
  const uniqueAccountIds: string[] = [
    ...new Set(getAwsServiceAccountInfos(qpqConfig).map((accountInfo) => accountInfo.awsAccountId)),
  ];

  return uniqueAccountIds;
};

export const getLocalServiceAccountInfo = (qpqConfig: QPQConfig): LocalServiceAccountInfo => {
  const awsServiceAccountInfoConfig = getAwsServiceAccountInfoConfig(qpqConfig);

  const serviceAccountInfo: LocalServiceAccountInfo = {
    moduleName: qpqCoreUtils.getApplicationModuleName(qpqConfig),
    applicationName: qpqCoreUtils.getApplicationName(qpqConfig),
    environment: qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
    feature: qpqCoreUtils.getApplicationModuleFeature(qpqConfig),

    awsAccountId: awsServiceAccountInfoConfig.deployAccountId,
    awsRegion: awsServiceAccountInfoConfig.deployRegion,
  };

  return serviceAccountInfo as LocalServiceAccountInfo;
};

export const getAwsServiceAccountInfoByDeploymentInfo = (
  qpqConfig: QPQConfig,

  targetModule?: string,
  targetEnvironment?: string,
  targetFeature?: string,
  targetApplication?: string,
): ServiceAccountInfo => {
  const awsServiceAccountInfos = getAwsServiceAccountInfos(qpqConfig);

  const getMatchWeight = (serviceAccountInfo: ServiceAccountInfo) => {
    // Note: remember not to have overlapping weights
    return (
      1.8 *
        Number(
          !serviceAccountInfo.applicationName ||
            serviceAccountInfo.applicationName === targetApplication,
        ) +
      1.4 *
        Number(
          !serviceAccountInfo.environment || serviceAccountInfo.environment === targetEnvironment,
        ) +
      1.2 *
        Number(!serviceAccountInfo.moduleName || serviceAccountInfo.moduleName === targetModule) +
      1.1 *
        Number(
          !serviceAccountInfo.feature ||
            (serviceAccountInfo.feature === targetFeature &&
              !serviceAccountInfo.feature === !targetFeature),
        )
    );
  };

  const sortedAwsServiceAccountInfos = awsServiceAccountInfos
    .map((info) => ({ info, weight: getMatchWeight(info) }))
    .sort((a, b) => {
      const weightDiff = b.weight - a.weight;
      if (weightDiff !== 0) return weightDiff;
      return Object.keys(b.info).length - Object.keys(a.info).length;
    });

  // if (printInfo) {
  //   console.log(`getMatchWeight: targetModule: [${targetModule}], targetEnvironment: [${targetEnvironment}], targetFeature: [${targetFeature}], targetApplication: [${targetApplication}]`);
  //   console.log(JSON.stringify(sortedAwsServiceAccountInfos.slice(0, 5), null, 2));
  // }

  const serviceAccountInfo = sortedAwsServiceAccountInfos.find((info) => info.weight > 0);

  if (!serviceAccountInfo) {
    throw new Error(
      `No aws service account info found for ${targetModule} ${targetEnvironment} ${targetFeature}`,
    );
  }

  return serviceAccountInfo.info;
};

export const getLambdaLayersWithFullPaths = (qpqConfig: QPQConfig): ApiLayer[] => {
  const awsServiceAccountInfoConfig = getAwsServiceAccountInfoConfig(qpqConfig);

  return awsServiceAccountInfoConfig.apiLayers.map((layer: ApiLayer) => ({
    name: layer.name,
    buildPath: layer.buildPath
      ? path.join(qpqCoreUtils.getConfigRoot(qpqConfig), layer.buildPath)
      : undefined,
    layerArn: layer.layerArn,
  }));
};

export const getDynamoTableNameOverrride = (srcKvsName: string, qpqConfig: QPQConfig): string => {
  // Get the key value store config
  const resource = qpqCoreUtils.getKeyValueStoreFullyQualifiedResourceName(srcKvsName, qpqConfig);

  // Grab all the overrides that do exist
  const dynamoOverrides = qpqCoreUtils.getConfigSettings<AwsDyanmoOverrideForKvsQPQConfigSetting>(
    qpqConfig,
    QPQAwsConfigSettingType.awsDyanmoOverrideForKvs,
  );

  // Find an override that matches the resource
  const dynamoOverride = dynamoOverrides.find((override) =>
    qpqCoreUtils.isSameResource(resource, override.kvsStore),
  );

  // If we found a matching resource, return the override
  if (dynamoOverride) {
    return dynamoOverride.dynamoTableName;
  }

  // No override found, return empty string
  return '';
};
