import { CreateUserRequest } from 'quidproquo-core';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  DeliveryMediumType,
  MessageActionType,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export const createUser = async (
  userPoolId: string,
  region: string,
  createUserRequest: CreateUserRequest,
): Promise<string> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const params: AdminCreateUserCommandInput = {
    UserPoolId: userPoolId,
    Username: createUserRequest.email,
    MessageAction: MessageActionType.SUPPRESS,
    DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
    UserAttributes: [{ Name: 'email', Value: createUserRequest.email }],
    ForceAliasCreation: false,
  };

  if (createUserRequest.phone) {
    params.DesiredDeliveryMediums!.push(DeliveryMediumType.SMS);
    params.UserAttributes!.push({ Name: 'phone_number', Value: createUserRequest.phone });
  }

  const response = await cognitoClient.send(new AdminCreateUserCommand(params));

  const username = response.User?.Username || '';

  // There has to be a better way than this?
  const passwordParams: AdminSetUserPasswordCommandInput = {
    Password: createUserRequest.password,
    Username: username,
    UserPoolId: userPoolId,
    Permanent: true,
  };

  await cognitoClient.send(new AdminSetUserPasswordCommand(passwordParams));
  // ///////////////////////

  return username;
};
