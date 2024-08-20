import { AuthenticateUserResponse } from 'quidproquo-core';

import {
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommandInput,
  RespondToAuthChallengeCommand,
  ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';

import { calculateSecretHash } from './utils/calculateSecretHash';
import { getUserPoolClientSecret } from './getUserPoolClientSecret';

import { cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo } from './utils/transformCognitoResponse';
import { createAwsClient } from '../createAwsClient';

export const respondToAuthChallengeChallenge = async (
  userPoolId: string,
  clientId: string,
  region: string,
  username: string,
  session: string,
  challengeNameType: ChallengeNameType,
  attributes: Record<string, string>,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, { region });

  const clientSecret = await getUserPoolClientSecret(userPoolId, clientId, region);
  const secretHash = calculateSecretHash(username, clientId, clientSecret);

  const params: RespondToAuthChallengeCommandInput = {
    ChallengeName: challengeNameType,
    ClientId: clientId,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      SECRET_HASH: secretHash,

      ...attributes,
    },
  };

  const issueDateTime = new Date().toISOString();
  const response = await cognitoClient.send(new RespondToAuthChallengeCommand(params));

  // transform the response into your custom format, similar to your refreshToken function
  return cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo(response, issueDateTime);
};
