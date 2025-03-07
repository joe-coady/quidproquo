import { askConfigSetParameter, AuthenticateUserResponse } from 'quidproquo-core';

export function* askSetAuthToken(authenticationInfo: AuthenticateUserResponse) {
  yield* askConfigSetParameter('authToken', JSON.stringify(authenticationInfo));
}
