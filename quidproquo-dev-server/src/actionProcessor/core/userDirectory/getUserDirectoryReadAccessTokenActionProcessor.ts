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

import { decodeAccessTokenForDev } from '../../../logic/auth/decodeAccessTokenForDev';

const getProcessReadAccessToken = (_qpqConfig: QPQConfig): ProcessorFor<typeof askUserDirectoryReadAccessToken> => {
  return async ({ userDirectoryName, ignoreExpiration }, { decodedAccessToken, accessToken }) => {
    if (decodedAccessToken) {
      // Prod parity: the awslambda processor rejects a session-cached token that has
      // expired unless the caller opted out. Dev tokens without an exp claim decode
      // to exp 0 and never expire (same rule as decodeAccessTokenForDev).
      if (!ignoreExpiration && decodedAccessToken.exp > 0 && decodedAccessToken.exp < Math.floor(Date.now() / 1000)) {
        return actionResultError(ErrorTypeEnum.Invalid, 'Access has expired');
      }

      return actionResult(decodedAccessToken);
    }

    const decoded = decodeAccessTokenForDev(userDirectoryName, accessToken, ignoreExpiration);

    if (!decoded) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    return actionResult(decoded);
  };
};

export const getUserDirectoryReadAccessTokenActionProcessor = createActionProcessor(askUserDirectoryReadAccessToken, getProcessReadAccessToken);
