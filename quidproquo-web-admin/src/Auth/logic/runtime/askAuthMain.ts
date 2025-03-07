import { AskResponse } from 'quidproquo-core';

import { askLoadAuthToken } from '../../../platformLogic';
import { askAuthUISetAuthInfo } from '../authActionCreator';
import { askRunRefreshTokensLoop } from './askRunRefreshTokensLoop';

export function* askAuthMain(): AskResponse<void> {
  const authInfo = yield* askLoadAuthToken();
  yield* askAuthUISetAuthInfo(authInfo);

  yield* askRunRefreshTokensLoop();
}
