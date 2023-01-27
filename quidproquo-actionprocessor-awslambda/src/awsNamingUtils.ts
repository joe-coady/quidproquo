import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

export const getConfigRuntimeResourceName = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const service = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationFeature(qpqConfig);

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
