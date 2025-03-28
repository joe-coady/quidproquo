import { askCatch, askConfigGetParameter, AskResponse, AuthenticateUserChallenge, AuthenticateUserResponse } from 'quidproquo-core';

export function* askLoadAuthToken(): AskResponse<AuthenticateUserResponse> {
  const authTokenParam = yield* askCatch(askConfigGetParameter('authToken'));

  if (!authTokenParam.success) {
    return {
      challenge: AuthenticateUserChallenge.NONE,
    };
  }

  return JSON.parse(authTokenParam.result);
}
