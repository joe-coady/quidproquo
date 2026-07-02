import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRefreshTokenActionProcessor,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { createDevAuthResponse } from '../../../logic/auth/devAuth';

const getProcessRefreshToken = (_qpqConfig: QPQConfig): UserDirectoryRefreshTokenActionProcessor => {
  return async ({ refreshToken }) => {
    // Keep the same user the refresh token was minted for, falling back to the dev user
    const decoded = qpqWebServerUtils.unsafeDecodeJWTPayload<{ username?: string; email?: string; sub?: string }>(refreshToken);

    return actionResult(createDevAuthResponse(decoded?.username || decoded?.email || decoded?.sub));
  };
};

export const getUserDirectoryRefreshTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RefreshToken]: getProcessRefreshToken(qpqConfig),
});
