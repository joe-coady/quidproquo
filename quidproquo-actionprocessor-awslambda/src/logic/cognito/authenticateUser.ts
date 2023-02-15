import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';

import { calculateSecretHash } from './utils/calculateSecretHash';
import { getUserPoolClientSecret } from './getUserPoolClientSecret';

export const authenticateUser = async (
  userPoolId: string,
  clientId: string,
  username: string,
  password: string,
  region: string,
): Promise<string> => {
  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const clientSecret = await getUserPoolClientSecret(userPoolId, clientId, region);
  const secretHash = calculateSecretHash(username, clientId, clientSecret);

  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
    UserPoolId: userPoolId,
    ClientId: clientId,

    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash,
    },
  };

  const response = await cognitoClient.send(new AdminInitiateAuthCommand(params));

  console.log(JSON.stringify(response, null, 2));

  return response.ChallengeName || '';
};
