import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

export const getConfigRuntimeResourceName = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  if (feature) {
    return `${resourceName}-${service}-${environment}-${feature}`;
  }

  return `${resourceName}-${service}-${environment}`;
};

export const getQpqRuntimeResourceName = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const name = getConfigRuntimeResourceName(resourceName, qpqConfig, resourceType);
  return `${name}-qpq`;
};
