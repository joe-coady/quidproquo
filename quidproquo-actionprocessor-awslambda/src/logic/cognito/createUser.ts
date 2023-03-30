import { CreateUserRequest } from 'quidproquo-core';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  DeliveryMediumType,
  MessageActionType,
} from '@aws-sdk/client-cognito-identity-provider';

import { authenticateUser } from './authenticateUser';
import { requestEmailVerificationCode } from './requestEmailVerificationCode';
import { setUserPassword } from './setUserPassword';

export const createUser = async (
  userPoolId: string,
  region: string,
  clientId: string,
  createUserRequest: CreateUserRequest,
): Promise<string> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const params: AdminCreateUserCommandInput = {
    UserPoolId: userPoolId,
    Username: createUserRequest.email,
    MessageAction: MessageActionType.SUPPRESS, // Don't contact the user
    DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
    UserAttributes: [
      { Name: 'email', Value: createUserRequest.email },
      { Name: 'email_verified', Value: 'false' },
    ],
    ForceAliasCreation: false,
  };

  if (createUserRequest.phone) {
    params.DesiredDeliveryMediums!.push(DeliveryMediumType.SMS);
    params.UserAttributes!.push({ Name: 'phone_number', Value: createUserRequest.phone });
  }

  const response = await cognitoClient.send(new AdminCreateUserCommand(params));

  const username = response.User?.Username || '';

  // Set the user's password
  await setUserPassword(region, userPoolId, username, createUserRequest.password);

  // Authenticate the user
  const authResponse = await authenticateUser(
    userPoolId,
    clientId,
    region,
    username,
    createUserRequest.password,
  );

  await requestEmailVerificationCode(region, authResponse.authenticationInfo?.accessToken!);

  return username;
};
