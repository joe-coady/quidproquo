import {
  CognitoIdentityProviderClient,
  VerifyUserAttributeCommand,
  VerifyUserAttributeCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export const verifyUserEmail = async (
  region: string,
  accessToken: string,
  verificationCode: string,
) => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const params: VerifyUserAttributeCommandInput = {
    AccessToken: accessToken,
    AttributeName: 'email',
    Code: verificationCode,
  };

  await cognitoClient.send(new VerifyUserAttributeCommand(params));
};
