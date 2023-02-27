import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

export const getConfigRuntimeResourceName = (
  resourceName: string,
  application: string,
  service: string,
  environment: string,
  feature?: string,
) => {
  const baseName = `${resourceName}-${application}-${service}-${environment}`;

  if (feature) {
    return `${baseName}-${feature}`;
  }

  return baseName;
};

export const getConfigRuntimeResourceNameFromConfig = (
  resourceName: string,
  qpqConfig: QPQConfig,
) => {
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getConfigRuntimeResourceName(resourceName, application, service, environment, feature);
};

export const getQpqRuntimeResourceName = (
  resourceName: string,
  application: string,
  service: string,
  environment: string,
  feature?: string,
  resourceType: string = '',
) => {
  const name = getConfigRuntimeResourceName(
    resourceName,
    application,
    service,
    environment,
    feature,
  );
  return `${name}-qpq${resourceType}`;
};

export const getQpqRuntimeResourceNameFromConfig = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getQpqRuntimeResourceName(
    resourceName,
    application,
    service,
    environment,
    feature,
    resourceType,
  );
};

export const getCFExportNameUserPoolIdFromConfig = (
  userDirectoryName: string,
  qpqConfig: QPQConfig,

  serviceOverride?: string,
  applicationOverride?: string,
) => {
  const application = applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig);
  const service = serviceOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getQpqRuntimeResourceName(
    userDirectoryName,
    application,
    service,
    environment,
    feature,
    'user-pool-id-export',
  );
};

export const getCFExportNameUserPoolClientIdFromConfig = (
  userDirectoryName: string,
  qpqConfig: QPQConfig,

  serviceOverride?: string,
  applicationOverride?: string,
) => {
  const application = applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig);
  const service = serviceOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getQpqRuntimeResourceName(
    userDirectoryName,
    application,
    service,
    environment,
    feature,
    'user-pool-client-id-export',
  );
};

export const getCFExportNameApiKeyIdFromConfig = (
  apiKeyName: string,
  qpqConfig: QPQConfig,

  serviceOverride?: string,
  applicationOverride?: string,
) => {
  const application = applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig);
  const service = serviceOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getQpqRuntimeResourceName(
    apiKeyName,
    application,
    service,
    environment,
    feature,
    'api-key-id-export',
  );
};
