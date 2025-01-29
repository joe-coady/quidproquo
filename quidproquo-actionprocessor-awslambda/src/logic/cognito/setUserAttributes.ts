import { UserAttributes } from 'quidproquo-core';

import { AdminUpdateUserAttributesCommand, AttributeType, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';
import { getCognitoUserAttributesFromQpqUserAttributes } from './cognitoAttributeMap';

export const setUserAttributes = async (userPoolId: string, region: string, username: string, userAttributes: UserAttributes): Promise<void> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const { userId, ...writeableUserAttributes } = userAttributes;

  const params = {
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: getCognitoUserAttributesFromQpqUserAttributes(writeableUserAttributes),
  };

  await cognitoClient.send(new AdminUpdateUserAttributesCommand(params));
};
