import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  DescribeUserPoolClientCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';

export const getUserPoolClientSecret = async (userPoolId: string, clientId: string, region: string): Promise<string> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const params: DescribeUserPoolClientCommandInput = {
    ClientId: clientId,
    UserPoolId: userPoolId,
  };

  const response = await cognitoClient.send(new DescribeUserPoolClientCommand(params));

  if (!response.UserPoolClient?.ClientSecret) {
    throw new Error('Can not find client secret for Cognito user pool client');
  }

  return response.UserPoolClient?.ClientSecret;
};
