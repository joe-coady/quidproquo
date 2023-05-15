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
  issueDateTime: string,
): AuthenticationInfo => {
  // Parse the issueDateTime and add the expiresIn to get the expiration date
  let issueDate = new Date(issueDateTime);
  issueDate.setSeconds(issueDate.getSeconds() + (authResult.ExpiresIn || 0));

  const expiresAt = issueDate.toISOString();

  return {
    accessToken: authResult.AccessToken,
    idToken: authResult.IdToken,
    refreshToken: authResult.RefreshToken,
    tokenType: authResult.TokenType,

    expirationDurationInSeconds: authResult.ExpiresIn,
    expiresAt,
  };
};

export const cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo = (
  authResponse: AdminInitiateAuthResponse,
  issueDateTime: string,
): AuthenticateUserResponse => {
  const res: AuthenticateUserResponse = {
    session: authResponse.Session,
    challenge: AuthenticateUserChallenge.NONE,
  };

  if (authResponse.AuthenticationResult) {
    res.authenticationInfo = cognitoAuthenticationResultTypeToQpqAuthenticationInfo(
      authResponse.AuthenticationResult,
      issueDateTime,
    );
  }

  return res;
};
