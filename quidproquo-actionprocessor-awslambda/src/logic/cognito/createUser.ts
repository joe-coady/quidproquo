import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';

export const createUser = async (
  userPoolId: string,
  email: string,
  phone: string,
  region: string,
): Promise<string> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const response = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      TemporaryPassword: '4!ShadowBlog!23',
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

  const username = response.User?.Username || '';

  return username;
};
