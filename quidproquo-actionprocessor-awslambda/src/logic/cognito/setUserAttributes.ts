import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand, AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { UserAttributes } from 'quidproquo-core';

import { getCognitoUserAttributesFromQpqUserAttributes } from './cognitoAttributeMap';
import { createAwsClient } from '../createAwsClient';

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
