import { AskResponse, askUserDirectoryRespondToAuthChallenge, AuthenticateUserChallenge, AuthenticateUserResponse } from 'quidproquo-core';

import { askGetAuthUserDirectoryName } from './askGetAuthUserDirectoryName';

export function* askRespondToAuthChallenge(
  username: string,
  challenge: AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED,
  session: string,
  newPassword: string,
): AskResponse<AuthenticateUserResponse> {
  const userDirectoryName = yield* askGetAuthUserDirectoryName();

  const response = yield* askUserDirectoryRespondToAuthChallenge(userDirectoryName, {
    username,
    challenge,
    session,
    newPassword,
  });

  return response;
}
