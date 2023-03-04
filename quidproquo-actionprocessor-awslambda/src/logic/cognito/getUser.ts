import {
  CognitoIdentityProviderClient,
  GetUserCommandInput,
  GetUserCommand,
  AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';

export interface UserAttributes {
  [attribute: string]: string;
}

export interface User {
  id: string;
  username: string;

  email: string;

  userAttributes: UserAttributes;
}

const getUserAttribute = (
  attributeName: string,
  userAttributes: AttributeType[],
): string | undefined => {
  const lowerAttributeName = attributeName.toLowerCase();

  const attribute = userAttributes.find((k) => k.Name?.toLowerCase() === lowerAttributeName);

  return attribute?.Value;
};

export const getUser = async (accessToken: string, region: string): Promise<User> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const params: GetUserCommandInput = {
    AccessToken: accessToken,
  };

  const response = await cognitoClient.send(new GetUserCommand(params));

  console.log(JSON.stringify(response, null, 2));

  const attributeTypes = (response.UserAttributes || []).filter((ua) => !!ua.Value);
  const userAttributes = attributeTypes.reduce(
    (acc, ua) => ({ ...acc, [ua.Name!]: ua.Value! }),
    {},
  );

  const user: User = {
    username: response.Username!,
    id: getUserAttribute('sub', attributeTypes)!,
    email: getUserAttribute('email', attributeTypes)!,

    userAttributes,
  };

  console.log(JSON.stringify(user, null, 2));

  return user;
};