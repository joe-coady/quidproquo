import {
  actionResult,
  actionResultError,
  askUserDirectorySetAccessToken,
  createActionProcessor,
  ErrorTypeEnum,
  ProcessorFor,
  QPQConfig,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { decodeAccessTokenForDev } from '../../../logic/auth/decodeAccessTokenForDev';

const getProcessSetAccessToken = (_qpqConfig: QPQConfig): ProcessorFor<typeof askUserDirectorySetAccessToken> => {
  return async ({ accessToken, userDirectoryName }, session, apl, logger, updateSession) => {
    const decodedAccessToken = decodeAccessTokenForDev(userDirectoryName, accessToken, false);

    if (!decodedAccessToken) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid accessToken');
    }

    updateSession({
      decodedAccessToken,
      accessToken,
    });

    return actionResult(decodedAccessToken);
  };
};

export const getUserDirectorySetAccessTokenActionProcessor = createActionProcessor(askUserDirectorySetAccessToken, getProcessSetAccessToken);
