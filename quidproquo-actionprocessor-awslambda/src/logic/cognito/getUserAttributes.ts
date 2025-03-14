import { UserAttributes } from 'quidproquo-core';

import { AdminGetUserCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';
import { getQpqAttributesFromCognitoUserAttributes } from './cognitoAttributeMap';

export const getUserAttributes = async (userPoolId: string, region: string, username: string): Promise<UserAttributes> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const params = {
    UserPoolId: userPoolId,
    Username: username,
  };

  const response = await cognitoClient.send(new AdminGetUserCommand(params));

  const validAttributes = (response.UserAttributes || []).filter((attr) => attr.Name && attr.Value) as { Name: string; Value: string }[];

  const attributes = getQpqAttributesFromCognitoUserAttributes(validAttributes);

  return attributes;
};
