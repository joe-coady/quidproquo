import { askConfigGetGlobal, AskResponse, askThrowError, askUserDirectoryReadAccessToken, ErrorTypeEnum } from 'quidproquo-core';

import { EVENT_DOC_USER_DIRECTORY_GLOBAL } from '../constants/eventDocGlobalNames';

// Re-reads the already-validated access token (route auth gated the request) to
// stamp createdBy/updatedBy without an extra user lookup.
export function* askEventDocResolveUserId(): AskResponse<string> {
  const userDirectory = yield* askConfigGetGlobal<string>(EVENT_DOC_USER_DIRECTORY_GLOBAL);

  const token = yield* askUserDirectoryReadAccessToken(userDirectory, false);

  if (!token?.userId) {
    return yield* askThrowError(ErrorTypeEnum.Unauthorized, 'User not authenticated');
  }

  return token.userId;
}
