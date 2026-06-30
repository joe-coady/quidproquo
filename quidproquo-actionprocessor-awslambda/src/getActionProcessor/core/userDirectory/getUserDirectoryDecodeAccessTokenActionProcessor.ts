import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryDecodeAccessTokenActionProcessor,
  UserDirectoryDecodeAccessTokenErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { decodeValidJwt } from '../../../logic/cognito/decodeValidJwt';

const getProcessDecodeAccessToken = (qpqConfig: QPQConfig): UserDirectoryDecodeAccessTokenActionProcessor => {
  return async ({ userDirectoryName, accessToken, ignoreExpiration }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const authInfo = await decodeValidJwt(userPoolId, region, ignoreExpiration, accessToken);

    if (!authInfo || !authInfo?.username) {
      return actionResultError(UserDirectoryDecodeAccessTokenErrorTypeEnum.Unauthorized, 'Invalid access token');
    }

    return actionResult({
      ...authInfo,

      userDirectory: userDirectoryName,
    });
  };
};

export const getUserDirectoryDecodeAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.DecodeAccessToken]: getProcessDecodeAccessToken(qpqConfig),
});
