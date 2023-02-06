import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

export const getConfigRuntimeResourceName = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  const baseName = `${resourceName}-${application}-${service}-${environment}`;

  if (feature) {
    return `${baseName}-${feature}`;
  }

  return baseName;
};

export const getQpqRuntimeResourceName = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const name = getConfigRuntimeResourceName(resourceName, qpqConfig, resourceType);
  return `${name}-qpq${resourceType}`;
};
