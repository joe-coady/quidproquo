import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqSettingConstructMap } from './QpqSettingConstructMap';
import { QpqServiceStack } from './constructs/core/QPQServiceStack';

export const getBaseStackName = (qpqConfig: QPQConfig) => {
  const appName = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationFeature(qpqConfig);

  if (feature) {
    return `${appName}-${environment}-${feature}`;
  }

  return `${appName}-${environment}`;
};

export const getInfrastructureStackName = (qpqConfig: QPQConfig) => {
  return `${getBaseStackName(qpqConfig)}-inf`;
};

export const getWebStackName = (qpqConfig: QPQConfig) => {
  return `${getBaseStackName(qpqConfig)}-web`;
};

export const getApiStackName = (qpqConfig: QPQConfig) => {
  return `${getBaseStackName(qpqConfig)}-api`;
};

export const createConstructs = (
  owner: QpqServiceStack,
  qpqConfig: QPQConfig,
  settingsToCreate: string[],
  qpqSettingConstructMap: QpqSettingConstructMap,
) => {
  for (var setting of qpqConfig) {
    const qpqCoreConfigSettingType = setting.configSettingType;

    if (
      settingsToCreate.indexOf(qpqCoreConfigSettingType) >= 0 &&
      qpqSettingConstructMap[qpqCoreConfigSettingType]
    ) {
      const ConstructClass = qpqSettingConstructMap[qpqCoreConfigSettingType];
      new ConstructClass(
        owner,
        qpqCoreUtils.getUniqueKeyForSetting(setting),
        owner.childProps(setting),
      );
    }
  }
};
