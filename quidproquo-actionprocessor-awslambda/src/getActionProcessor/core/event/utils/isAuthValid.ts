import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { RouteAuthSettings, qpqWebServerUtils } from 'quidproquo-webserver';

import { verifyJwt } from '../../../../logic/cognito/verifyJwt';
import { getExportedValue } from '../../../../logic/cloudformation/getExportedValue';
import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
} from '../../../../awsNamingUtils';

export const isAuthValid = async (
  qpqConfig: QPQConfig,
  authHeader?: string | null,
  authSettings?: RouteAuthSettings,
) => {
  // If there are no auth settings ~ Its valid.
  if (!authSettings || !authSettings.userDirectoryName) {
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
