import { AuthenticateUserResponse,CreateUserRequest } from 'quidproquo-core';
import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  CognitoIdentityProviderClient,
  DeliveryMediumType,
  MessageActionType,
} from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';
import { authenticateUser } from './authenticateUser';
import { getCognitoUserAttributesFromQpqUserAttributes } from './cognitoAttributeMap';
import { setUserPassword } from './setUserPassword';

export const createUser = async (
  userPoolId: string,
  region: string,
  clientId: string,
  createUserRequest: CreateUserRequest,
): Promise<AuthenticateUserResponse> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const params: AdminCreateUserCommandInput = {
    UserPoolId: userPoolId,
    Username: createUserRequest.email,
    MessageAction: MessageActionType.SUPPRESS, // Don't contact the user
    DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
    UserAttributes: getCognitoUserAttributesFromQpqUserAttributes(createUserRequest),
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
  const authResponse: AuthenticateUserResponse = await authenticateUser(userPoolId, clientId, region, false, username, createUserRequest.password);

  return authResponse;
};
