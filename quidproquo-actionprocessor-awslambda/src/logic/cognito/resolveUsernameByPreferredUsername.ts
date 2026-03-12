import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';

export const resolveUsernameByPreferredUsername = async (
  userPoolId: string,
  region: string,
  preferredUsername: string,
): Promise<string> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const response = await cognitoClient.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: 1,
      Filter: `preferred_username = "${preferredUsername}"`,
    }),
  );

  const resolvedUsername = response.Users?.[0]?.Username;

  return resolvedUsername || preferredUsername;
};
