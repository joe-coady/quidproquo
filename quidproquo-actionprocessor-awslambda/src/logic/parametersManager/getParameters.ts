import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

const smClient = new SSMClient({});

export const getParameters = async (parameterNames: string[]): Promise<string[]> => {
  const response = await smClient.send(
    new GetParametersCommand({
      Names: parameterNames,
    }),
  );

  const resolvedParams = response.Parameters || [];

  return parameterNames.map((pn) => resolvedParams.find((rp) => rp.Name == pn)?.Value || '');
};
