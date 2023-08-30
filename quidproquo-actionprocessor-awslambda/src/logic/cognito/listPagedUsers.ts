import { UserAttributes, QpqPagedData } from 'quidproquo-core';

import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersResponse,
} from '@aws-sdk/client-cognito-identity-provider';


import { getQpqAttributesFromCognitoUserAttributes } from './cognitoAttributeMap';

import { pageKeyToPaginationToken, paginationTokenToPageKey } from './utils';

export const listPagedUsers = async (
  userPoolId: string,
  region: string,
  pageKey?: string,
): Promise<QpqPagedData<UserAttributes>> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const response: ListUsersResponse = await cognitoClient.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      PaginationToken: pageKeyToPaginationToken(pageKey),
    }),
  );

  const users: UserAttributes[] = (response.Users || []).map((user) => {
    const validAttributes = (user.Attributes || []).filter(
      (attr) => attr.Name && attr.Value,
    ) as {
      Name: string;
      Value: string;
    }[];
    
    return getQpqAttributesFromCognitoUserAttributes(validAttributes);
  });

  return {
    nextPageKey: paginationTokenToPageKey(response.PaginationToken),
    items: users,
  };
};