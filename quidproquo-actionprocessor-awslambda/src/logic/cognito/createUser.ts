import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';

import { getUserPoolId } from './getUserPoolId';

export const createUser = async (
  userPoolName: string,
  email: string,
  phone: string,
  region: string,
): Promise<string> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });
  const userPoolId = await getUserPoolId(userPoolName, region);

  const response = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      DesiredDeliveryMediums: [
        email && DeliveryMediumType.EMAIL,
        phone && DeliveryMediumType.SMS,
      ].filter((m) => !!m),
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'phone_number', Value: phone },
      ].filter((a) => !!a.Value),
      ForceAliasCreation: false,
    }),
  );

  return response.User?.Username || '';
};
