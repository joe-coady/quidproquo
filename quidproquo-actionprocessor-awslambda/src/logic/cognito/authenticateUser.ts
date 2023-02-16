import {
  AuthenticateUserRequest,
  AuthenticateUserResponse,
  AuthenticateUserChallenge,
  AuthenticationInfo,
} from 'quidproquo-core';

import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AuthFlowType,
  AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider';

import { calculateSecretHash } from './utils/calculateSecretHash';
import { getUserPoolClientSecret } from './getUserPoolClientSecret';

const cognitoAuthenticationResultTypeToQpqAuthenticationInfo = (
  authResult: AuthenticationResultType,
): AuthenticationInfo => ({
  accessToken: authResult.AccessToken,
  idToken: authResult.IdToken,
  expiresIn: authResult.ExpiresIn,
  refreshToken: authResult.RefreshToken,
  tokenType: authResult.TokenType,
});

export const authenticateUser = async (
  userPoolId: string,
  clientId: string,
  region: string,
  authenticateUserRequest: AuthenticateUserRequest,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const clientSecret = await getUserPoolClientSecret(userPoolId, clientId, region);
  const secretHash = calculateSecretHash(authenticateUserRequest.email, clientId, clientSecret);

  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
    UserPoolId: userPoolId,
    ClientId: clientId,

    AuthParameters: {
      USERNAME: authenticateUserRequest.email,
      PASSWORD: authenticateUserRequest.password,
      SECRET_HASH: secretHash,
    },
  };

  const response = await cognitoClient.send(new AdminInitiateAuthCommand(params));

  console.log(JSON.stringify(response, null, 2));

  const authenticateUserResponse: AuthenticateUserResponse = {
    session: response.Session,
    challenge: AuthenticateUserChallenge.NONE,
  };

  if (response.AuthenticationResult) {
    authenticateUserResponse.authenticationInfo =
      cognitoAuthenticationResultTypeToQpqAuthenticationInfo(response.AuthenticationResult);
  }

  return authenticateUserResponse;
};
