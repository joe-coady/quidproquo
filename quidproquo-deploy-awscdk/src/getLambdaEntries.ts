import path from 'path';

export const webpackEntryNames = [
  'lambdaAPIGatewayEvent',
  'lambdaAPIGatewayEvent_redirect',
  'lambdaWebsocketAPIGatewayEvent',
  'lambdaEventBridgeEventStackDeploy',
  'lambdaEventBridgeEvent',
  'lambdaEventOriginRequest',
  'lambdaEventViewerRequest',
  'lambdaServiceFunctionExecute',
  'lambdaSQSEvent',
  'lambdaS3FileEvent',

  'lambdaCognitoTriggerEvent_CustomMessage',
];

export const getLambdaEntries = () => {
  return webpackEntryNames.reduce((acc, name) => ({ ...acc, [name]: path.join(__dirname, `./lambdas/${name}.js`) }), {});
};
