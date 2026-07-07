import { UserAttributes } from 'quidproquo-core';

import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';
import { getQpqAttributesFromCognitoUserAttributes } from './cognitoAttributeMap';

// ListUsers returns an empty list rather than throwing for no match, so we throw
// our own error with a discriminable `code` for the processor's catch to map.
export class UserNotFoundError extends Error {
  readonly code = 'USER_NOT_FOUND';

  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export const getUserAttributesBySub = async (userPoolId: string, region: string, sub: string): Promise<UserAttributes> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const response = await cognitoClient.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `sub = "${sub}"`,
    }),
  );

  const [user] = response?.Users || [];
  if (!user) {
    throw new UserNotFoundError();
  }

  const validAttributes = (user.Attributes || []).filter((attr) => attr.Name && attr.Value) as {
    Name: string;
    Value: string;
  }[];

  return getQpqAttributesFromCognitoUserAttributes(validAttributes);
};
