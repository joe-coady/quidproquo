import {
  UserDirectoryReadAccessTokenActionProcessor,
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

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { decodeValidJwt } from '../../../logic/cognito/decodeValidJwt';

const getUserDirectoryReadAccessTokenActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryReadAccessTokenActionProcessor => {
  return async ({ userDirectoryName, serviceOverride }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig, serviceOverride),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig, serviceOverride),
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

    return actionResult({
      userId: authInfo.userId,
      username: authInfo.username,
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.ReadAccessToken]:
      getUserDirectoryReadAccessTokenActionProcessor(qpqConfig),
  };
};
