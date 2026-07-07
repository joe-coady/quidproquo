import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySetAccessTokenActionProcessor,
} from 'quidproquo-core';

import { decodeAccessTokenForDev } from '../../../logic/auth/decodeAccessTokenForDev';

const getProcessSetAccessToken = (_qpqConfig: QPQConfig): UserDirectorySetAccessTokenActionProcessor => {
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

export const getUserDirectorySetAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetAccessToken]: getProcessSetAccessToken(qpqConfig),
});
