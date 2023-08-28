import {
  UserDirectorySetAccessTokenActionProcessor,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
} from 'quidproquo-core';

const getUserDirectorySetAccessTokenActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectorySetAccessTokenActionProcessor => {
  return async ({ accessToken }, session, aps, logger, updateSession) => {
    
    updateSession({
      accessToken
    });

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.SetAccessToken]:
      getUserDirectorySetAccessTokenActionProcessor(qpqConfig),
  };
};
