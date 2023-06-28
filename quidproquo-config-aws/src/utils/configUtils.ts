import {
  qpqCoreUtils,
  QPQConfig,
  EventBusSubscriptionDetails,
  EventBusSubscription,
} from 'quidproquo-core';

import { ServiceAccountInfo, LocalServiceAccountInfo } from '../types';

import { AwsServiceAccountInfoQPQConfigSetting, QPQAwsConfigSettingType } from '../config';

const getAwsServiceAccountInfoConfig = (
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
      1.8 * Number(serviceAccountInfo.applicationName === targetApplication) +
      1.4 * Number(serviceAccountInfo.environment === targetEnvironment) +
      1.2 * Number(serviceAccountInfo.moduleName === targetModule) +
      1.1 * Number(serviceAccountInfo.feature === targetFeature)
    );
  };

  const serviceAccountInfo = awsServiceAccountInfos
    .map((info) => ({ info, weight: getMatchWeight(info) }))
    .sort((a, b) => b.weight - a.weight)
    .find((info) => info.weight > 0);

  if (!serviceAccountInfo) {
    throw new Error(
      `No aws service account info found for ${targetModule} ${targetEnvironment} ${targetFeature}`,
    );
  }

  return serviceAccountInfo.info;
};

export const getEventBusSubscriptionDetails = (
  eventBusSubscription: EventBusSubscription,
  qpqConfig: QPQConfig,
): EventBusSubscriptionDetails => {
  const localServiceAccountInfo = getLocalServiceAccountInfo(qpqConfig);

  if (typeof eventBusSubscription === 'string') {
    return {
      eventBusName: eventBusSubscription,
      module: localServiceAccountInfo.moduleName,
      application: localServiceAccountInfo.applicationName,
      feature: localServiceAccountInfo.feature,
      environment: localServiceAccountInfo.environment,
    };
  }

  return {
    eventBusName: eventBusSubscription.eventBusName,
    module: eventBusSubscription.module ?? localServiceAccountInfo.moduleName,
    application: eventBusSubscription.application ?? localServiceAccountInfo.applicationName,
    feature: eventBusSubscription.feature ?? localServiceAccountInfo.feature,
    environment: eventBusSubscription.environment ?? localServiceAccountInfo.environment,
  };
};
