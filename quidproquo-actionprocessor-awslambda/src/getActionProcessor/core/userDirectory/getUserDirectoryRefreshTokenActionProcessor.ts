import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRefreshTokenActionProcessor,
  UserDirectoryRefreshTokenErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { refreshToken as cognitoRefreshToken } from '../../../logic/cognito/refreshToken';

const getProcessRefreshToken = (qpqConfig: QPQConfig): UserDirectoryRefreshTokenActionProcessor => {
  return async ({ userDirectoryName, refreshToken }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    if (!session.decodedAccessToken || !session.decodedAccessToken.username) {
      return actionResultError(UserDirectoryRefreshTokenErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    // NOTE: we intentionally do NOT gate on decodedAccessToken.wasValid here.
    // Refresh must accept a signature-valid-but-expired access token (that's the
    // point of refreshing), and wasValid folds in the expiry check. The trust
    // anchor for this operation is the refreshToken itself: Cognito's
    // REFRESH_TOKEN_AUTH validates it and the SECRET_HASH binds it to `username`,
    // so a forged/unverified username cannot mint tokens for another user.

    try {
      const authResponse = await cognitoRefreshToken(
        userPoolId,
        userPoolClientId,
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        session.decodedAccessToken.username,
        refreshToken,
      );

      return actionResult(authResponse);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        NotAuthorizedException: () => actionResultError(UserDirectoryRefreshTokenErrorTypeEnum.Unauthorized, 'Refresh token is invalid or has expired'),
        TooManyRequestsException: () => actionResultError(UserDirectoryRefreshTokenErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryRefreshTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RefreshToken]: getProcessRefreshToken(qpqConfig),
});
