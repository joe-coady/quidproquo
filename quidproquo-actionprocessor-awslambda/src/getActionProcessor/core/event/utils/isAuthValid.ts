import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { RouteAuthSettings, qpqWebServerUtils } from 'quidproquo-webserver';

import { verifyJwt } from '../../../../logic/cognito/verifyJwt';
import { getExportedValue } from '../../../../logic/cloudformation/getExportedValue';
import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
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
    getCFExportNameUserPoolIdFromConfig(
      userDirectoryName,
      qpqConfig,
      authSettings.serviceName,
      authSettings.applicationName,
    ),
    region,
  );

  // Resolve the user pool client id
  const userPoolClientId = await getExportedValue(
    getCFExportNameUserPoolClientIdFromConfig(
      userDirectoryName,
      qpqConfig,
      authSettings.serviceName,
      authSettings.applicationName,
    ),
    region,
  );

  // Verify the token
  return await verifyJwt(accessToken, userPoolId, userPoolClientId, 'access');
};

const isAuthValidForApiKeys = async (
  authSettings: RouteAuthSettings,
  apiKeyHeader?: string | null,
): Promise<boolean> => {
  const apiKeys = authSettings.apiKeys || [];
  if (apiKeys.length === 0) {
    return true;
  }

  const index = apiKeys.findIndex((apiKey) => apiKey.value === apiKeyHeader);

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
  const authKeysValid = await isAuthValidForApiKeys(authSettings, apiKeyHeader);

  return cognitoValid && authKeysValid;
};
