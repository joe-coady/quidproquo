import { AuthenticateUserChallenge,AuthenticateUserResponse, AuthenticationInfo } from 'quidproquo-core';
import { AdminInitiateAuthResponse, AuthenticationResultType, ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';

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

export const cognitoChallengeNameTypeToQpqAuthenticateUserChallenge = (
  cognitoChallengeName: ChallengeNameType | string | undefined,
): AuthenticateUserChallenge => {
  if (!cognitoChallengeName) {
    return AuthenticateUserChallenge.NONE;
  }

  const map: Record<string, AuthenticateUserChallenge | string> = {
    [ChallengeNameType.NEW_PASSWORD_REQUIRED]: AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED,
    [ChallengeNameType.CUSTOM_CHALLENGE]: AuthenticateUserChallenge.CUSTOM_CHALLENGE,
  };

  // TODO: handle the NOT-IMP cases
  const challenge = map[cognitoChallengeName] || `QPQ-NOT-IMP-${cognitoChallengeName}`;

  return challenge as AuthenticateUserChallenge;
};

export const cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo = (
  authResponse: AdminInitiateAuthResponse,
  issueDateTime: string,
): AuthenticateUserResponse => {
  console.log('authResponse XYZ', authResponse);

  const res: AuthenticateUserResponse = {
    session: authResponse.Session,
    challenge: cognitoChallengeNameTypeToQpqAuthenticateUserChallenge(authResponse.ChallengeName),
    challengeParameters: authResponse.ChallengeParameters,
  };

  if (authResponse.AuthenticationResult) {
    res.authenticationInfo = cognitoAuthenticationResultTypeToQpqAuthenticationInfo(authResponse.AuthenticationResult, issueDateTime);
  }

  return res;
};
