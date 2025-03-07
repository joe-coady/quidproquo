import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { AuthEffect, AuthSetPasswordEffect, AuthSetUsernameEffect } from './authTypes';

export function* askAuthUISetUsername(username: string): AskResponse<void> {
  yield* askStateDispatchEffect<AuthSetUsernameEffect>(AuthEffect.SetUsername, username);
}

export function* askAuthUISetPassword(password: string): AskResponse<void> {
  yield* askStateDispatchEffect<AuthSetPasswordEffect>(AuthEffect.SetPassword, password);
}
