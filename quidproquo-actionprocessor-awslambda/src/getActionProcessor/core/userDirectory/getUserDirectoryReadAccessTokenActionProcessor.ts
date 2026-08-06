import {
  actionResult,
  actionResultError,
  askUserDirectoryReadAccessToken,
  createActionProcessor,
  ErrorTypeEnum,
  ProcessorFor,
  QPQConfig,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { decodeAccessToken } from '../../../logic/cognito/decodeAccessToken';

const getProcessReadAccessToken = (qpqConfig: QPQConfig): ProcessorFor<typeof askUserDirectoryReadAccessToken> => {
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

export const getUserDirectoryReadAccessTokenActionProcessor = createActionProcessor(askUserDirectoryReadAccessToken, getProcessReadAccessToken);
