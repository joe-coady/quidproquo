import { qpqCoreUtils } from 'quidproquo-core';
import { DeploymentSettings } from './DeploymentSettings';

export const getStackName = (deploymentSettings: DeploymentSettings) => {
  const appName = qpqCoreUtils.getAppName(deploymentSettings.qpqConfig);

  return `${appName}-${deploymentSettings.environment}`;
};
