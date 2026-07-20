import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRevokeRefreshTokenActionProcessor,
  UserDirectoryRevokeRefreshTokenErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { revokeRefreshToken } from '../../../logic/cognito/revokeRefreshToken';

const getProcessRevokeRefreshToken = (qpqConfig: QPQConfig): UserDirectoryRevokeRefreshTokenActionProcessor => {
  return async ({ userDirectoryName, refreshToken }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    try {
      await revokeRefreshToken(userPoolId, userPoolClientId, region, refreshToken);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        NotAuthorizedException: () =>
          actionResultError(UserDirectoryRevokeRefreshTokenErrorTypeEnum.Unauthorized, 'Refresh token is invalid or already revoked'),
        TooManyRequestsException: () =>
          actionResultError(UserDirectoryRevokeRefreshTokenErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryRevokeRefreshTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RevokeRefreshToken]: getProcessRevokeRefreshToken(qpqConfig),
});
