import { askConfigSetParameter, AuthenticateUserResponse } from 'quidproquo-core';

import { askLoadAuthToken } from './askLoadAuthToken';

export function* askSaveAuthToken(newAuthenticateUserResponse: AuthenticateUserResponse) {
  // const oldAuthenticateUserResponse: AuthenticateUserResponse = yield* askLoadAuthToken();

  // const merged: AuthenticateUserResponse = {
  //   ...oldAuthenticateUserResponse,
  //   ...newAuthenticateUserResponse,

  //   authenticationInfo: {
  //     ...(oldAuthenticateUserResponse?.authenticationInfo || {}),
  //     ...(newAuthenticateUserResponse?.authenticationInfo || {}),
  //   },
  // };
  yield* askConfigSetParameter('authToken', JSON.stringify(newAuthenticateUserResponse));
}
