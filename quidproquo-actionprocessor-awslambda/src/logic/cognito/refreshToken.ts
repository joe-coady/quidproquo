import { AuthenticateUserResponse } from 'quidproquo-core';

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

export const refreshToken = async (
  userPoolId: string,
  clientId: string,
  region: string,
  username: string,
  refreshToken: string,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const clientSecret = await getUserPoolClientSecret(userPoolId, clientId, region);
  const secretHash = calculateSecretHash(username, clientId, clientSecret);

  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
    UserPoolId: userPoolId,
    ClientId: clientId,

    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
      SECRET_HASH: secretHash,
    },
  };

  // Time we issued the request
  const issueDateTime = new Date().toISOString();
  const response = await cognitoClient.send(new AdminInitiateAuthCommand(params));

  const authResponse = cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo(response, issueDateTime);

  // Cognito's REFRESH_TOKEN_AUTH flow does NOT return a refresh token — the existing one stays
  // valid and is reused — so AuthenticationResult.RefreshToken is undefined here. Carry the
  // caller's refresh token forward so the client keeps a usable session; without this it's
  // dropped after the first refresh and the session can never refresh again. (If refresh-token
  // rotation is ever enabled, Cognito DOES return a new one — then we keep that instead.)
  if (authResponse.authenticationInfo && !authResponse.authenticationInfo.refreshToken) {
    authResponse.authenticationInfo.refreshToken = refreshToken;
  }

  return authResponse;
};
