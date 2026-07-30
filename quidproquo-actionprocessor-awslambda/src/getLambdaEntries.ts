import path from 'path';

// One entry per lambda handler under ./lambdas; each name must match its source
// filename exactly (yes, including the apiGatway spelling).
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

  'dynamoStreamEvent_kvsStreamEvent',

  'eventBridgeEvent_recurringSchedule',
  'eventBridgeEvent_stackDeploy',

  's3Event_fileEvent',
  'sqsEvent_queueEvent',
];

/**
 * Maps each lambda entry name to its handler path, for deploy bundlers
 * (quidproquo-deploy-rspack/webpack) to use as bundle entry points.
 */
export const getLambdaEntries = (): Record<string, string> =>
  Object.fromEntries(entryNames.map((name) => [name, path.join(__dirname, `./lambdas/${name}`)]));
