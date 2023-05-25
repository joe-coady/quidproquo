import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { memoFunc } from '../cache/memoFunc';

export const getParameter = memoFunc(
  async (parameterName: string, region: string): Promise<string> => {
    const smClient = new SSMClient({
      region,
    });

    const response = await smClient.send(
      new GetParameterCommand({
        Name: parameterName,
      }),
    );

    return response.Parameter?.Value || '';
  },
  60,
);
