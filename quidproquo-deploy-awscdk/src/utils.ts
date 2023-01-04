import { qpqCoreUtils } from 'quidproquo-core';
import { DeploymentSettings } from './DeploymentSettings';

export const getStackName = (deploymentSettings: DeploymentSettings) => {
  const appName = qpqCoreUtils.getAppName(deploymentSettings.qpqConfig);
  const environment = qpqCoreUtils.getAppFeature(deploymentSettings.qpqConfig);

  return `${appName}-${environment}`;
};
