import { AskResponse, askStateRead, AuthenticateUserResponse } from 'quidproquo-core';

import { askPlatformRequest, askSetAuthToken } from '../../../platformLogic';
import { AuthLoginPayload, AuthState } from '../authTypes';

export function* askAuthLogin(): AskResponse<void> {
  const { username, password } = yield* askStateRead<AuthState>('');

  const response = yield* askPlatformRequest<AuthLoginPayload, AuthenticateUserResponse>('POST', '/login', {
    body: {
      username,
      password,
    },
  });

  if (response.status < 200 || response.status >= 300) {
    return;
  }

  yield* askSetAuthToken(response.data);
}
