/* eslint-disable no-console */
import {
    AskResponse,
    askUserDirectoryAuthenticateUser,
    AuthenticateUserResponse,
} from 'quidproquo-core';
  
export function* askLogin(
    email: string,
    password: string
): AskResponse<AuthenticateUserResponse> {
    const authResponse = yield* askUserDirectoryAuthenticateUser('qpq-admin', {
        email,
        password,
    });

    return authResponse;
}
