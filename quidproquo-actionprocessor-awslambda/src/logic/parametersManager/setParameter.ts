import { SSMClient, PutParameterCommand, ParameterType  } from '@aws-sdk/client-ssm';

export const setParameter = async (parameterName: string, region: string, value: string): Promise<void> => {
  const smClient = new SSMClient({
    region,
  });

  await smClient.send(
    new PutParameterCommand({
      Name: parameterName,
      Value: value,
      Overwrite: true,
      Type: ParameterType.STRING
    }),
  );
}