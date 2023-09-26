import {
  APIGatewayClient,
  GetApiKeysCommand,
  GetApiKeysCommandInput,
} from '@aws-sdk/client-api-gateway';

import { ApiKey } from 'quidproquo-webserver';

import { createAwsClient } from '../createAwsClient';

export const getApiKeys = async (region: string, ...keyNames: string[]): Promise<ApiKey[]> => {
  const apiGatewayClient = createAwsClient(APIGatewayClient, { region });

  const input: GetApiKeysCommandInput = {
    includeValues: true,
    limit: 500,
  };

  const res = await apiGatewayClient.send(new GetApiKeysCommand(input));

  return (
    res.items
      ?.filter((i) => keyNames.indexOf(i.name!) >= 0)
      .map((i) => ({ name: i.name, value: i.value, description: i.description } as ApiKey)) || []
  );
};
