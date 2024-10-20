import {
  UserDirectoryReadAccessTokenActionProcessor,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  actionResultError,
  ErrorTypeEnum,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { decodeAccessToken } from '../../../logic/cognito/decodeAccessToken';

const getProcessReadAccessToken = (qpqConfig: QPQConfig): UserDirectoryReadAccessTokenActionProcessor => {
  return async ({ userDirectoryName, ignoreExpiration }, { decodedAccessToken, accessToken }) => {
    if (decodedAccessToken) {
      if (!ignoreExpiration && decodedAccessToken.exp < Math.floor(Date.now() / 1000)) {
        return actionResultError(ErrorTypeEnum.Invalid, 'Access has expired');
      }

      return actionResult(decodedAccessToken);
    }

    const decodedAuthToken = await decodeAccessToken(userDirectoryName, qpqConfig, accessToken, ignoreExpiration);

    if (!decodedAuthToken || !decodedAuthToken.username) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    return actionResult(decodedAuthToken);
  };
};

export const getUserDirectoryReadAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ReadAccessToken]: getProcessReadAccessToken(qpqConfig),
});
