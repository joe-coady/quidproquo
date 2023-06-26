import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { ServiceAccountInfo } from '../types';

import { AwsServiceAccountInfoQPQConfigSetting, QPQAwsConfigSettingType } from '../config';

const getAwsServiceAccountInfoConfig = (
  qpqConfig: QPQConfig,
): AwsServiceAccountInfoQPQConfigSetting => {
  const serviceAccountInfos = qpqCoreUtils.getConfigSettings<AwsServiceAccountInfoQPQConfigSetting>(
    qpqConfig,
    QPQAwsConfigSettingType.serviceAccountInfo,
  );

  if (serviceAccountInfos.length === 0) {
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
    getServiceAccountInfo(qpqConfig),
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

export const getServiceAccountInfo = (qpqConfig: QPQConfig): ServiceAccountInfo => {
  const awsServiceAccountInfoConfig = getAwsServiceAccountInfoConfig(qpqConfig);

  const serviceAccountInfo: ServiceAccountInfo = {
    moduleName: qpqCoreUtils.getApplicationModuleName(qpqConfig),
    applicationName: qpqCoreUtils.getApplicationName(qpqConfig),
    environment: qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
    feature: qpqCoreUtils.getApplicationModuleFeature(qpqConfig),

    awsAccountId: awsServiceAccountInfoConfig.deployAccountId,
    awsRegion: awsServiceAccountInfoConfig.deployRegion,
  };

  return serviceAccountInfo;
};
