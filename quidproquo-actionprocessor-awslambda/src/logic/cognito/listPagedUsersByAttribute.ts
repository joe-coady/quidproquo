import { QpqPagedData,UserAttributes } from 'quidproquo-core';
import { CognitoIdentityProviderClient, ListUsersCommand, ListUsersResponse } from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';
import { getQpqAttributesFromCognitoUserAttributes } from './cognitoAttributeMap';
import { pageKeyToPaginationToken, paginationTokenToPageKey } from './utils';

export const listPagedUsersByAttribute = async (
  userPoolId: string,
  region: string,
  attributeName: string,
  attributeValue: string,
  limit?: number,
  pageKey?: string,
): Promise<QpqPagedData<UserAttributes>> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const response: ListUsersResponse = await cognitoClient.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: limit,
      Filter: `${attributeName} = "${attributeValue}"`,
      PaginationToken: pageKeyToPaginationToken(pageKey),
    }),
  );

  const users: UserAttributes[] = (response.Users || []).map((user) => {
    const validAttributes = (user.Attributes || []).filter((attr) => attr.Name && attr.Value) as {
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
