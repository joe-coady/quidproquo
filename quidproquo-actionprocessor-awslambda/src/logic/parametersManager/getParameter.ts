import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { memoFuncAsync } from '../cache/memoFuncAsync';

export const getParameter = memoFuncAsync(
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
