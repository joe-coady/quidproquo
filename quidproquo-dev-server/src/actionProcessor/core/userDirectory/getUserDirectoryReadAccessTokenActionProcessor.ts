import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryReadAccessTokenActionProcessor,
} from 'quidproquo-core';

import { decodeAccessTokenForDev } from '../../../logic/auth/decodeAccessTokenForDev';

const getProcessReadAccessToken = (_qpqConfig: QPQConfig): UserDirectoryReadAccessTokenActionProcessor => {
  return async ({ userDirectoryName, ignoreExpiration }, { decodedAccessToken, accessToken }) => {
    if (decodedAccessToken) {
      return actionResult(decodedAccessToken);
    }

    const decoded = decodeAccessTokenForDev(userDirectoryName, accessToken, ignoreExpiration);

    if (!decoded) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    return actionResult(decoded);
  };
};

export const getUserDirectoryReadAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ReadAccessToken]: getProcessReadAccessToken(qpqConfig),
});
