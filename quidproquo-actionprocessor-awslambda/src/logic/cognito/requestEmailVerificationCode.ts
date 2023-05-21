import {
  CognitoIdentityProviderClient,
  GetUserAttributeVerificationCodeCommand,
  GetUserAttributeVerificationCodeCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export const requestEmailVerificationCode = async (region: string, accessToken: string) => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const params: GetUserAttributeVerificationCodeCommandInput = {
    AccessToken: accessToken,
    AttributeName: 'email', // Request verification for the email attribute
  };

  const requestEmailVerificationCodeResponse = await cognitoClient.send(
    new GetUserAttributeVerificationCodeCommand(params),
  );
};
