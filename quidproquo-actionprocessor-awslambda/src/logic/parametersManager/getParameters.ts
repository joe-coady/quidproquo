import { GetParametersCommand,SSMClient } from '@aws-sdk/client-ssm';

import { memoFuncAsync } from '../cache/memoFuncAsync';
import { createAwsClient } from '../createAwsClient';

export const getParameters = memoFuncAsync(async (parameterNames: string[], region: string): Promise<string[]> => {
  const ssmClient = createAwsClient(SSMClient, { region });

  const response = await ssmClient.send(
    new GetParametersCommand({
      Names: parameterNames,
    }),
  );

  const resolvedParams = response.Parameters || [];

  return parameterNames.map((pn) => resolvedParams.find((rp) => rp.Name == pn)?.Value || '');
}, 60);
