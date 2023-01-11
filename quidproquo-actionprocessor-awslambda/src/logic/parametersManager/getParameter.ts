import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

export const getParameter = async (parameterName: string, region: string): Promise<string> => {
  const smClient = new SSMClient({
    region,
  });

  const response = await smClient.send(
    new GetParameterCommand({
      Name: parameterName,
    }),
  );

  return response.Parameter?.Value || '';
};
