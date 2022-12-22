import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const smClient = new SSMClient({});

export const getParameter = async (parameterName: string): Promise<string> => {
  const response = await smClient.send(
    new GetParameterCommand({
      Name: parameterName,
    }),
  );

  return response.Parameter?.Value || '';
};
