import { APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda';

export const getWebsocketAPIGatewayEventExecutor = () => {
  return async (event: APIGatewayProxyWebsocketEventV2, context: Context) => {
    console.log(JSON.stringify(event));

    return {
      statusCode: 200
    }
  };
};

// Default executor
export const executeWebsocketAPIGatewayEvent = getWebsocketAPIGatewayEventExecutor();
