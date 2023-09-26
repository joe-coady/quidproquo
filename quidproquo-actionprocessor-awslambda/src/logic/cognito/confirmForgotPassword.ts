import { AuthenticateUserResponse } from 'quidproquo-core';

import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

import { calculateSecretHash } from './utils/calculateSecretHash';
import { getUserPoolClientSecret } from './getUserPoolClientSecret';
import { authenticateUser } from './authenticateUser';
import { createAwsClient } from '../createAwsClient';

export const confirmForgotPassword = async (
  userPoolId: string,
  clientId: string,
  region: string,
  code: string,
  username: string,
  password: string,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, { region });

  const clientSecret = await getUserPoolClientSecret(userPoolId, clientId, region);
  const secretHash = calculateSecretHash(username, clientId, clientSecret);

  const params: ConfirmForgotPasswordCommandInput = {
    ClientId: clientId,

    ConfirmationCode: code,
    SecretHash: secretHash,
    Password: password,
    Username: username,
  };

  await cognitoClient.send(new ConfirmForgotPasswordCommand(params));

  // Authenticate the user
  const authResponse: AuthenticateUserResponse = await authenticateUser(
    userPoolId,
    clientId,
    region,
    username,
    password,
  );

  return authResponse;
};
