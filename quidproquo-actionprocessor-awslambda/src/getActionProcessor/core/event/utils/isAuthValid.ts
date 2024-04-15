import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { RouteAuthSettings } from 'quidproquo-webserver';

import { verifyJwt } from '../../../../logic/cognito/verifyJwt';
import { getExportedValue } from '../../../../logic/cloudformation/getExportedValue';
import { getApiKeys } from '../../../../logic/apiGateway/getApiKeys';
import {
  getCFExportNameUserPoolIdFromConfig,
  getConfigRuntimeResourceName,
} from '../../../../awsNamingUtils';

const isAuthValidForCognito = async (
  qpqConfig: QPQConfig,
  authSettings: RouteAuthSettings,
  authHeader?: string | null,
) => {
  // If there are no auth settings ~ Its valid.
  if (!authSettings.userDirectoryName) {
    return true;
  }

  // We need a header to be able to auth
  if (!authHeader) {
    return false;
  }

  // Make sure we have a Bearer token
  const [authType, accessToken] = authHeader.split(' ');
  if (authType !== 'Bearer' || !accessToken) {
    return false;
  }

  // Grab the user directory to auth against
  const userDirectoryName = authSettings.userDirectoryName!;
  const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

  // Resolve the user pool id
  const userPoolId = await getExportedValue(
    getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
    region,
  );

  // Verify the token
  return await verifyJwt(accessToken, userPoolId, region, false);
};

const isAuthValidForApiKeys = async (
  qpqConfig: QPQConfig,
  authSettings: RouteAuthSettings,
  apiKeyHeader?: string | null,
): Promise<boolean> => {
  const apiKeys = authSettings.apiKeys || [];
  if (apiKeys.length === 0) {
    return true;
  }

  const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  const realApiKeys = await getApiKeys(
    region,
    ...apiKeys.map((apiKey) => {
      const apiKeyApplication = apiKey.applicationName || application;
      const apiKeyService = apiKey.serviceName || service;

      return getConfigRuntimeResourceName(
        apiKey.name,
        apiKeyApplication,
        apiKeyService,
        environment,
        feature,
      );
    }),
  );

  const index = realApiKeys.findIndex((apiKey) => apiKey.value === apiKeyHeader);
  return index >= 0;
};

export const isAuthValid = async (
  qpqConfig: QPQConfig,
  authHeader?: string | null,
  apiKeyHeader?: string | null,
  authSettings?: RouteAuthSettings,
) => {
  // If there are no auth settings ~ Its valid.
  if (!authSettings) {
    return true;
  }

  const cognitoValid = await isAuthValidForCognito(qpqConfig, authSettings, authHeader);
  const authKeysValid = await isAuthValidForApiKeys(qpqConfig, authSettings, apiKeyHeader);

  return cognitoValid && authKeysValid;
};
