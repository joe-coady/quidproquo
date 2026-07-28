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

import { decodeAccessToken } from '../../../logic/cognito/decodeAccessToken';

const getProcessReadAccessToken = (qpqConfig: QPQConfig): UserDirectoryReadAccessTokenActionProcessor => {
  return async ({ userDirectoryName, ignoreExpiration }, { decodedAccessToken, accessToken }) => {
    if (decodedAccessToken) {
      if (!ignoreExpiration && decodedAccessToken.exp < Math.floor(Date.now() / 1000)) {
        return actionResultError(ErrorTypeEnum.Invalid, 'Access has expired');
      }

      return actionResult(decodedAccessToken);
    }

    // decodeAccessToken throws on a missing/unverifiable token; surface that as
    // a typed Unauthorized result (matching the SetAccessToken processor)
    // instead of letting the raw error escape as a GenericError.
    try {
      return actionResult(await decodeAccessToken(userDirectoryName, qpqConfig, accessToken, ignoreExpiration));
    } catch {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }
  };
};

export const getUserDirectoryReadAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ReadAccessToken]: getProcessReadAccessToken(qpqConfig),
});
