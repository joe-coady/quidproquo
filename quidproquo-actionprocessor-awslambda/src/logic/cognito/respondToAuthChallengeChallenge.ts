import { AuthenticateUserResponse } from 'quidproquo-core';
import {
  ChallengeNameType,
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';
import { calculateSecretHash } from './utils/calculateSecretHash';
import { cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo } from './utils/transformCognitoResponse';
import { getUserPoolClientSecret } from './getUserPoolClientSecret';

export const respondToAuthChallengeChallenge = async (
  userPoolId: string,
  clientId: string,
  region: string,
  username: string,
  session: string,
  challengeNameType: ChallengeNameType,
  attributes: Record<string, string>,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

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
