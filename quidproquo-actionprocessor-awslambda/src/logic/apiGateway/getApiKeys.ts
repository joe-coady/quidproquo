import {
  APIGatewayClient,
  GetApiKeysCommand,
  GetApiKeysCommandInput,
} from '@aws-sdk/client-api-gateway';

import { ApiKey } from 'quidproquo-webserver';

export const getApiKeys = async (region: string, ...keyNames: string[]): Promise<ApiKey[]> => {
  const apiGatewayClient = new APIGatewayClient({ region });

  const input: GetApiKeysCommandInput = {
    includeValues: true,
    limit: 500,
  };

  const res = await apiGatewayClient.send(new GetApiKeysCommand(input));

  return (
    res.items
      ?.filter((i) => keyNames.indexOf(i.name!))
      .map((i) => ({ name: i.name, value: i.value, description: i.description } as ApiKey)) || []
  );
};
