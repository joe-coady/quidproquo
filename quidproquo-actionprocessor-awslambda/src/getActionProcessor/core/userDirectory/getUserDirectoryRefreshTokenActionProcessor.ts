import {
  UserDirectoryRefreshTokenActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  actionResultError,
  ErrorTypeEnum,
  ActionProcessorList,
  ActionProcessorListResolver,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig, getCFExportNameUserPoolClientIdFromConfig } from '../../../awsNamingUtils';

import { refreshToken as cognitoRefreshToken } from '../../../logic/cognito/refreshToken';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getProcessRefreshToken = (qpqConfig: QPQConfig): UserDirectoryRefreshTokenActionProcessor => {
  return async ({ userDirectoryName, refreshToken }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    if (!session.decodedAccessToken || !session.decodedAccessToken.username) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    const authResponse = await cognitoRefreshToken(
      userPoolId,
      userPoolClientId,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      session.decodedAccessToken.username,
      refreshToken,
    );

    return actionResult(authResponse);
  };
};

export const getUserDirectoryRefreshTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RefreshToken]: getProcessRefreshToken(qpqConfig),
});
