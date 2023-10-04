import { QPQConfig, qpqCoreUtils, ResourceName, CrossServiceResourceName } from 'quidproquo-core';
import { getAwsServiceAccountInfoByDeploymentInfo } from 'quidproquo-config-aws';

export const getGlobalConfigRuntimeResourceName = (
  resourceName: string,
  application: string,
  environment: string,
  feature?: string,
) => {
  const baseName = `${resourceName}-${application}-${environment}`;

  if (feature) {
    return `${baseName}-${feature}`;
  }

  return baseName;
};

export const getGlobalQpqRuntimeResourceName = (
  resourceName: string,
  application: string,
  environment: string,
  feature?: string,
  resourceType: string = '',
) => {
  const name = getGlobalConfigRuntimeResourceName(resourceName, application, environment, feature);
  return `${name}-qpq${resourceType}`;
};

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

export const getConfigRuntimeResourceNameFromConfigWithServiceOverride = (
  resourceName: string,
  qpqConfig: QPQConfig,
  serviceOverride?: string,
) => {
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const service = serviceOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig);
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
  resourceName: ResourceName,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const crossServiceResourceName = qpqCoreUtils.resolveCrossServiceResourceName(resourceName);

  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const service =
    crossServiceResourceName.service || qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getQpqRuntimeResourceName(
    crossServiceResourceName.name,
    application,
    service,
    environment,
    feature,
    resourceType,
  );
};

export const getKvsDynamoTableNameFromConfig = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, resourceName);

  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const service =
    storeConfig?.owner?.module ||
    qpqCoreUtils.getApplicationModuleName(qpqConfig);

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

export const getCFExportNameSnsTopicArnFromConfig = (
  eventBusName: string,
  qpqConfig: QPQConfig,

  applicationOverride?: string,
) => {
  const application = applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getGlobalQpqRuntimeResourceName(
    eventBusName,
    application,
    environment,
    feature,
    'sns-topic-arn-export',
  );
};

export const getCFExportNameDistributionIdArnFromConfig = (
  webEntryName: string,
  qpqConfig: QPQConfig,

  serviceOverride?: string,
  applicationOverride?: string,
) => {
  const application = applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig);
  const service = serviceOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getQpqRuntimeResourceName(
    webEntryName,
    application,
    service,
    environment,
    feature,
    'distribution-id-export',
  );
};

export const getCFExportNameWebsocketApiIdFromConfig = (
  websocketApiName: string,
  qpqConfig: QPQConfig,

  serviceOverride?: string,
  applicationOverride?: string,
) => {
  const application = applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig);
  const service = serviceOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  return getQpqRuntimeResourceName(
    websocketApiName,
    application,
    service,
    environment,
    feature,
    'websocket-api-id-export',
  );
};

export const getEventBusSnsTopicArn = (
  eventBusName: string,
  qpqConfig: QPQConfig,

  module: string,
  environment: string,
  application: string,
  feature?: string,
) => {
  const topicName = getConfigRuntimeResourceName(
    eventBusName,
    application,
    module,
    environment,
    feature,
  );

  const accountInfo = getAwsServiceAccountInfoByDeploymentInfo(
    qpqConfig,
    module,
    environment,
    feature,
    application,
  );

  const awsAccountId = accountInfo.awsAccountId;
  const region = accountInfo.awsRegion;

  return `arn:aws:sns:${region}:${awsAccountId}:${topicName}`;
};

export const getBaseStackName = (qpqConfig: QPQConfig) => {
  const appName = qpqCoreUtils.getApplicationName(qpqConfig);
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  const baseName = `${appName}-${moduleName}-${environment}`;

  if (feature) {
    return `${baseName}-${feature}`;
  }

  return baseName;
};

export const getInfStackName = (qpqConfig: QPQConfig) => {
  return `${getBaseStackName(qpqConfig)}-inf`;
};

export const getWebStackName = (qpqConfig: QPQConfig) => {
  return `${getBaseStackName(qpqConfig)}-web`;
};

export const getApiStackName = (qpqConfig: QPQConfig) => {
  return `${getBaseStackName(qpqConfig)}-api`;
};
