import {
  UserDirectorySetAccessTokenActionProcessor,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { decodeAccessToken } from '../../../logic/cognito';

const getProcessSetAccessToken = (qpqConfig: QPQConfig): UserDirectorySetAccessTokenActionProcessor => {
  return async ({ accessToken, userDirectoryName }, session, apl, logger, updateSession) => {
    const decodedAccessToken = await decodeAccessToken(userDirectoryName, qpqConfig, accessToken, false);

    updateSession({
      decodedAccessToken: decodedAccessToken,
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
