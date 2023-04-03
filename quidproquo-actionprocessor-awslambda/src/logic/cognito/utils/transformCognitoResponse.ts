import {
  AuthenticateUserResponse,
  AuthenticationInfo,
  AuthenticateUserChallenge,
} from 'quidproquo-core';

import {
  AuthenticationResultType,
  AdminInitiateAuthResponse,
} from '@aws-sdk/client-cognito-identity-provider';

export const cognitoAuthenticationResultTypeToQpqAuthenticationInfo = (
  authResult: AuthenticationResultType,
): AuthenticationInfo => ({
  accessToken: authResult.AccessToken,
  idToken: authResult.IdToken,
  expiresIn: authResult.ExpiresIn,
  refreshToken: authResult.RefreshToken,
  tokenType: authResult.TokenType,
});

export const cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo = (
  authResponse: AdminInitiateAuthResponse,
): AuthenticateUserResponse => {
  const res: AuthenticateUserResponse = {
    session: authResponse.Session,
    challenge: AuthenticateUserChallenge.NONE,
  };

  if (authResponse.AuthenticationResult) {
    res.authenticationInfo = cognitoAuthenticationResultTypeToQpqAuthenticationInfo(
      authResponse.AuthenticationResult,
    );
  }

  return res;
};
