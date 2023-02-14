import {
  CognitoIdentityProviderClient,
  ListUserPoolsCommand,
  ListUserPoolsCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export const getUserPoolId = async (userPoolName: string, region: string): Promise<string> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  // TODO: Support more then 60
  const listUserPoolsParams: ListUserPoolsCommandInput = {
    MaxResults: 60,
    NextToken: '',
  };

  const response = await cognitoClient.send(new ListUserPoolsCommand(listUserPoolsParams));
  const userPool = response.UserPools?.find((up) => up.Name === userPoolName);

  if (!userPool || !userPool.Id) {
    throw new Error(`User Pool '${userPoolName}' not found in region '${region}'`);
  }

  return userPool.Id;
};
