import {
  UserDirectoryReadAccessTokenActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  actionResultError,
  ErrorTypeEnum,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { decodeValidJwt } from '../../../logic/cognito/decodeValidJwt';

const getProcessReadAccessToken = (qpqConfig: QPQConfig): UserDirectoryReadAccessTokenActionProcessor => {
  return async ({ userDirectoryName, ignoreExpiration }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const authInfo = await decodeValidJwt(userPoolId, region, ignoreExpiration, session.accessToken);

    if (!authInfo || !authInfo?.username) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    return actionResult({
      userId: authInfo.userId,
      username: authInfo.username,
    });
  };
};

export const getUserDirectoryReadAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ReadAccessToken]: getProcessReadAccessToken(qpqConfig),
});
