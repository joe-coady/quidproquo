import {
  UserDirectoryDecodeAccessTokenActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { decodeValidJwt } from '../../../logic/cognito/decodeValidJwt';

const getUserDirectoryDecodeAccessTokenActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryDecodeAccessTokenActionProcessor => {
  return async ({ userDirectoryName, accessToken, ignoreExpiration, serviceOverride }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig, serviceOverride),
      region,
    );

    const authInfo = await decodeValidJwt(userPoolId, region, ignoreExpiration, accessToken);

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
    [UserDirectoryActionType.DecodeAccessToken]:
      getUserDirectoryDecodeAccessTokenActionProcessor(qpqConfig),
  };
};
