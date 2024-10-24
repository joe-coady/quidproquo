import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRefreshTokenActionProcessor,
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
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    const authResponse = await cognitoRefreshToken(
      userPoolId,
      userPoolClientId,
      qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
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
