import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryDecodeAccessTokenActionProcessor,
} from 'quidproquo-core';

import { decodeAccessTokenForDev } from '../../../logic/auth/decodeAccessTokenForDev';

const getProcessDecodeAccessToken = (_qpqConfig: QPQConfig): UserDirectoryDecodeAccessTokenActionProcessor => {
  return async ({ userDirectoryName, accessToken, ignoreExpiration }) => {
    const decodedAccessToken = decodeAccessTokenForDev(userDirectoryName, accessToken, ignoreExpiration);

    if (!decodedAccessToken) {
      return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid access token');
    }

    return actionResult(decodedAccessToken);
  };
};

export const getUserDirectoryDecodeAccessTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.DecodeAccessToken]: getProcessDecodeAccessToken(qpqConfig),
});
