import { CreateUserRequest, AuthenticateUserResponse } from 'quidproquo-core';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  DeliveryMediumType,
  MessageActionType,
} from '@aws-sdk/client-cognito-identity-provider';

import { authenticateUser } from './authenticateUser';
import { setUserPassword } from './setUserPassword';

const cognitoAttributeMap: Record<keyof CreateUserRequest, string> = {
  email: 'email',
  emailVerified: 'email_verified',
  password: 'password',

  address: 'address',
  birthDate: 'birthdate',
  familyName: 'family_name',
  gender: 'gender',
  givenName: 'given_name',
  locale: 'locale',
  middleName: 'middle_name',
  name: 'name',
  nickname: 'nickname',
  phoneNumber: 'phone_number',
  picture: 'picture',
  preferredUsername: 'preferred_username',
  profile: 'profile',
  website: 'website',
  zoneInfo: 'zoneinfo',
};

export const getUserAttributesFromCreateUserRequest = (createUserRequest: CreateUserRequest) => {
  return Object.keys(createUserRequest)
    .map((key) => ({
      Name: cognitoAttributeMap[key as keyof CreateUserRequest],
      Value: `${createUserRequest[key as keyof CreateUserRequest]}`,
    }))
    .filter((attribute) => !!attribute.Value && attribute.Name !== 'password');
};

export const createUser = async (
  userPoolId: string,
  region: string,
  clientId: string,
  createUserRequest: CreateUserRequest,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const params: AdminCreateUserCommandInput = {
    UserPoolId: userPoolId,
    Username: createUserRequest.email,
    MessageAction: MessageActionType.SUPPRESS, // Don't contact the user
    DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
    UserAttributes: getUserAttributesFromCreateUserRequest(createUserRequest),
    ForceAliasCreation: false,
  };

  if (createUserRequest.phoneNumber) {
    params.DesiredDeliveryMediums!.push(DeliveryMediumType.SMS);
  }

  const response = await cognitoClient.send(new AdminCreateUserCommand(params));

  const username = response.User?.Username || '';

  // Set the user's password
  await setUserPassword(region, userPoolId, username, createUserRequest.password);

  // Authenticate the user
  const authResponse: AuthenticateUserResponse = await authenticateUser(
    userPoolId,
    clientId,
    region,
    username,
    createUserRequest.password,
  );

  return authResponse;
};
