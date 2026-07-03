import { askConfigGetGlobal, AskResponse, askThrowError, askUserDirectoryReadAccessToken, ErrorTypeEnum } from 'quidproquo-core';

import { EVENT_DOC_USER_DIRECTORY_GLOBAL } from '../constants/eventDocGlobalNames';
import type { EventDocEventActor } from '../models';

// Actor comes straight off the validated access token (it carries the username),
// so the event is stamped without a separate user lookup.
export function* askEventDocResolveActor(): AskResponse<EventDocEventActor> {
  const userDirectory = yield* askConfigGetGlobal<string>(
    EVENT_DOC_USER_DIRECTORY_GLOBAL
  );

  const token = yield* askUserDirectoryReadAccessToken(userDirectory, false);

  if (!token?.userId) {
    return yield* askThrowError(
      ErrorTypeEnum.Unauthorized,
      'User not authenticated'
    );
  }

  return {
    userId: token.userId,
    userDisplayName: token.username,
  };
}
