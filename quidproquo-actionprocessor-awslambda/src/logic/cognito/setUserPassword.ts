import {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommandInput,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

export const setUserPassword = async (
  region: string,
  userPoolId: string,
  username: string,
  password: string,
) => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  // There has to be a better way than this?
  const passwordParams: AdminSetUserPasswordCommandInput = {
    Password: password,
    Username: username,
    UserPoolId: userPoolId,
    Permanent: true,
  };

  await cognitoClient.send(new AdminSetUserPasswordCommand(passwordParams));
};
