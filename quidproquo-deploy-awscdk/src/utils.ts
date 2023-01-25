import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { DeploymentSettings } from './DeploymentSettings';
import { QpqSettingConstructMap } from './QpqSettingConstructMap';
import { QpqServiceStack } from './constructs/core/QPQServiceStack';

export const getStackName = (deploymentSettings: DeploymentSettings) => {
  const appName = qpqCoreUtils.getAppName(deploymentSettings.qpqConfig);
  const environment = qpqCoreUtils.getAppFeature(deploymentSettings.qpqConfig);

  return `${appName}-${environment}`;
};

export const getInfrastructureStackName = (qpqConfig: QPQConfig) => {
  const appName = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getAppFeature(qpqConfig);

  return `${appName}-${environment}-inf`;
};

export const getWebStackName = (qpqConfig: QPQConfig) => {
  const appName = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getAppFeature(qpqConfig);

  return `${appName}-${environment}-web`;
};

export const getApiStackName = (qpqConfig: QPQConfig) => {
  const appName = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getAppFeature(qpqConfig);

  return `${appName}-${environment}-api`;
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
        owner.childId(qpqCoreUtils.getUniqueKeyForSetting(setting)),
        owner.childProps(setting),
      );
    }
  }
};
