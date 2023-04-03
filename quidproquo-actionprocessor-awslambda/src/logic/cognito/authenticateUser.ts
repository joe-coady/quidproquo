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
import { requestEmailVerificationCode } from './requestEmailVerificationCode';

const cognitoAuthenticationResultTypeToQpqAuthenticationInfo = (
  authResult: AuthenticationResultType,
): AuthenticationInfo => ({
  accessToken: authResult.AccessToken,
  idToken: authResult.IdToken,
  expiresIn: authResult.ExpiresIn,
  refreshToken: authResult.RefreshToken,
  tokenType: authResult.TokenType,
});

// TODO: retry for TooManyRequestsException

export const authenticateUser = async (
  userPoolId: string,
  clientId: string,
  region: string,
  username: string,
  password: string,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const clientSecret = await getUserPoolClientSecret(userPoolId, clientId, region);
  const secretHash = calculateSecretHash(username, clientId, clientSecret);

  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
    UserPoolId: userPoolId,
    ClientId: clientId,

    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash,
    },
  };

  try {
    const response = await cognitoClient.send(new AdminInitiateAuthCommand(params));

    const authenticateUserResponse: AuthenticateUserResponse = {
      session: response.Session,
      challenge: AuthenticateUserChallenge.NONE,
    };

    if (response.AuthenticationResult) {
      authenticateUserResponse.authenticationInfo =
        cognitoAuthenticationResultTypeToQpqAuthenticationInfo(response.AuthenticationResult);
    }

    return authenticateUserResponse;
  } catch (e) {
    if (e instanceof Error) {
      switch (e.name) {
        case 'PasswordResetRequiredException':
          return {
            challenge: AuthenticateUserChallenge.RESET_PASSWORD,
          };
      }

      throw new Error(`${e.name}: ${e.message}`);
    }

    console.log('authenticateUser Error: ', e);

    throw new Error(`Unknown error has occurred in authenticateUser`);
  }
};
