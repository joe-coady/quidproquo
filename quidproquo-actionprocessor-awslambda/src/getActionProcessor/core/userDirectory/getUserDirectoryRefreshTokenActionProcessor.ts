import {
  UserDirectoryRefreshTokenActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
} from '../../../awsNamingUtils';

import { refreshToken as cognitoRefreshToken } from '../../../logic/cognito/refreshToken';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { decodeValidJwt } from '../../../logic/cognito/decodeValidJwt';

const getUserDirectoryRefreshTokenActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryRefreshTokenActionProcessor => {
  return async ({ userDirectoryName, refreshToken }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const authInfo = await decodeValidJwt(
      userPoolId,
      userPoolClientId,
      'access',
      session.accessToken,
    );
    if (!authInfo || !authInfo?.username) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    const authResponse = await cognitoRefreshToken(
      userPoolId,
      userPoolClientId,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      authInfo?.username,
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
