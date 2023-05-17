import { AuthenticateUserResponse, AuthenticateUserChallenge } from 'quidproquo-core';

import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';

import { calculateSecretHash } from './utils/calculateSecretHash';
import { getUserPoolClientSecret } from './getUserPoolClientSecret';

import { cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo } from './utils/transformCognitoResponse';

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

  // Time we issued the request
  const issueDateTime = new Date().toISOString();

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
    console.log('authenticateUser response: ', JSON.stringify(response, null, 2));

    return cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo(response, issueDateTime);
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
