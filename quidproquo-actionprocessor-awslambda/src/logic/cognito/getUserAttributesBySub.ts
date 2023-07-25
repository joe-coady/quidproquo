import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import { UserAttributes } from 'quidproquo-core';

import { getQpqAttributesFromCognitoUserAttributes } from './cognitoAttributeMap';

export const getUserAttributesBySub = async (
  userPoolId: string,
  region: string,
  sub: string,
): Promise<UserAttributes> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const response = await cognitoClient.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `sub = "${sub}"`,
    }),
  );

  console.log(response);

  const [user] = response?.Users || [];
  if (!user) {
    throw new Error('User not found');
  }

  const validAttributes = (user.Attributes || []).filter((attr) => attr.Name && attr.Value) as {
    Name: string;
    Value: string;
  }[];

  return getQpqAttributesFromCognitoUserAttributes(validAttributes);
};