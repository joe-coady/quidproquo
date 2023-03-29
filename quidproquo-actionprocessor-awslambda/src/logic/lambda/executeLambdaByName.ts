import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export const executeLambdaByName = async <R>(
  functionName: string,
  region: string,
  payload: any,
): Promise<R | undefined> => {
  const lambda = new LambdaClient({ region });

  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));

  const response = await lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
      Payload: encodedPayload,
      InvocationType: 'RequestResponse',
    }),
  );

  if (response.FunctionError) {
    throw new Error(response.FunctionError);
  }

  if (response.Payload) {
    const jsonString = new TextDecoder().decode(response.Payload);
    const object = JSON.parse(jsonString);

    return object;
  }

  return undefined;
};
