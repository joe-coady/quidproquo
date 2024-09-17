import path from 'path';

export const entryNames = [
  'anyExecuteServiceFunctionEvent_serviceFunction',

  'apiGatewayEventHandler_redirect',
  'apiGatewayEventHandler',

  'apiGatwayEventWebsocketWithIdentity_websocketEvent',

  'cloudFrontRequestEvent_originRequest',
  'cloudFrontRequestEvent_viewerRequest',

  'customMessageTriggerEvent_customMessage',
  'customMessageTriggerEvent_defineAuthChallenge',
  'customMessageTriggerEvent_createAuthChallenge',
  'customMessageTriggerEvent_verifyAuthChallenge',

  'eventBridgeEvent_recurringSchedule',
  'eventBridgeEvent_stackDeploy',

  's3Event_fileEvent',
  'sqsEvent_queueEvent',
];

export const getLambdaEntries = (): Record<string, string> =>
  entryNames.reduce(
    (acc, name) => ({
      ...acc,
      [name]: path.join(__dirname, `./lambdas/${name}`),
    }),
    {},
  );
