import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { memoFunc } from '../cache/memoFunc';

export const getSecret = memoFunc(async (secretName: string, region: string): Promise<string> => {
  const smClient = new SecretsManagerClient({
    region,
  });

  const response = await smClient.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );

  return response.SecretString || '';
}, 60);
