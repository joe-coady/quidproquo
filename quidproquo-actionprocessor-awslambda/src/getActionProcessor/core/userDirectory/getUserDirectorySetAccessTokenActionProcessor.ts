import {
  UserDirectorySetAccessTokenActionProcessor,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

const getProcessSetAccessToken = (qpqConfig: QPQConfig): UserDirectorySetAccessTokenActionProcessor => {
  return async ({ accessToken }, session, aps, logger, updateSession) => {
    updateSession({
      accessToken,
    });

    return actionResult(void 0);
  };
};

export const getUserDirectorySetAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetAccessToken]: getProcessSetAccessToken(qpqConfig),
});
