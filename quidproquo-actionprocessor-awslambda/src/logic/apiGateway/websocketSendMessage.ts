import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { createAwsClient } from '../createAwsClient';

export const sendMessageToWebSocketConnection = async (apiId: string, connectionId: string, region: string, payload: any): Promise<void> => {
  // Create a new ApiGatewayManagementApiClient
  const apiGatewayManagementApiClient = createAwsClient(ApiGatewayManagementApiClient, {
    apiVersion: '2018-11-29',
    endpoint: `https://${apiId}.execute-api.${region}.amazonaws.com/prod`,
    region,
  });

  // Create a new PostToConnectionCommand with the connection ID and payload
  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: JSON.stringify(payload), // Convert payload to string if necessary
  });

  await apiGatewayManagementApiClient.send(command);
};
