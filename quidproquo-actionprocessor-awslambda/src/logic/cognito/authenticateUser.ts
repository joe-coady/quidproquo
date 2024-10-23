import { AuthenticateUserChallenge, AuthenticateUserResponse, UserDirectoryAuthenticateUserActionPayload } from 'quidproquo-core';

import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AuthFlowType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';
import { calculateSecretHash } from './utils/calculateSecretHash';
import { cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo } from './utils/transformCognitoResponse';
import { getUserPoolClientSecret } from './getUserPoolClientSecret';

// TODO: retry for TooManyRequestsException

export const authenticateUser = async (
  userPoolId: string,
  clientId: string,
  region: string,
  isCustom: boolean,
  username: string,
  password?: string,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const clientSecret = await getUserPoolClientSecret(userPoolId, clientId, region);
  const secretHash = calculateSecretHash(username, clientId, clientSecret);

  // Time we issued the request
  const issueDateTime = new Date().toISOString();

  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: isCustom ? AuthFlowType.CUSTOM_AUTH : AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
    UserPoolId: userPoolId,
    ClientId: clientId,

    AuthParameters: {
      USERNAME: username,
      SECRET_HASH: secretHash,
    },
  };

  if (password) {
    params.AuthParameters!.PASSWORD = password;
  }

  const response = await cognitoClient.send(new AdminInitiateAuthCommand(params));

  return cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo(response, issueDateTime);
};
