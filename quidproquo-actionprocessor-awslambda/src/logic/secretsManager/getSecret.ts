import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const getSecret = async (secretName: string, region: string): Promise<string> => {
  const smClient = new SecretsManagerClient({
    region,
  });

  const response = await smClient.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );

  return response.SecretString || '';
};
