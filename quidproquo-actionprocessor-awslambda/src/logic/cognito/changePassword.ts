import {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
  ChangePasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export const changePassword = async (
  accessToken: string,
  previousPassword: string,
  proposedPassword: string,
  region: string,
): Promise<void> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const params: ChangePasswordCommandInput = {
    AccessToken: accessToken,
    PreviousPassword: previousPassword,
    ProposedPassword: proposedPassword,
  };

  await cognitoClient.send(new ChangePasswordCommand(params));
};
