import { InvokeCommand,LambdaClient } from '@aws-sdk/client-lambda';

import { createAwsClient } from '../createAwsClient';

export const executeLambdaByName = async <R>(functionName: string, region: string, payload: any, isAsync: boolean): Promise<R | undefined> => {
  const lambdaClient = createAwsClient(LambdaClient, { region });

  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));

  const response = await lambdaClient.send(
    new InvokeCommand({
      FunctionName: functionName,
      Payload: encodedPayload,
      InvocationType: isAsync ? 'Event' : 'RequestResponse',
    }),
  );

  if (response.FunctionError) {
    // Get more details about the error if available
    const errorDetails = response.Payload ? new TextDecoder().decode(response.Payload) : '';
    throw new Error(`Lambda Error: ${response.FunctionError}. Details: ${errorDetails}`);
  }

  if (!isAsync && response.Payload) {
    const jsonString = new TextDecoder().decode(response.Payload);
    if (jsonString) {
      const object = JSON.parse(jsonString);
      return object;
    }
  }

  return undefined;
};
