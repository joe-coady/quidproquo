import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { memoFuncAsync } from '../cache/memoFuncAsync';

export const getParameters = memoFuncAsync(
  async (parameterNames: string[], region: string): Promise<string[]> => {
    const smClient = new SSMClient({ region });

    const response = await smClient.send(
      new GetParametersCommand({
        Names: parameterNames,
      }),
    );

    const resolvedParams = response.Parameters || [];

    return parameterNames.map((pn) => resolvedParams.find((rp) => rp.Name == pn)?.Value || '');
  },
  60,
);
