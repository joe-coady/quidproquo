import {
  UserDirectoryRefreshTokenActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
} from '../../../awsNamingUtils';

import { refreshToken as cognitoRefreshToken } from '../../../logic/cognito/refreshToken';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getUserDirectoryRefreshTokenActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryRefreshTokenActionProcessor => {
  return async ({ userDirectoryName, username, refreshToken }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const authResponse = await cognitoRefreshToken(
      userPoolId,
      userPoolClientId,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      username,
      refreshToken,
    );

    return actionResult(authResponse);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.RefreshToken]: getUserDirectoryRefreshTokenActionProcessor(qpqConfig),
  };
};
