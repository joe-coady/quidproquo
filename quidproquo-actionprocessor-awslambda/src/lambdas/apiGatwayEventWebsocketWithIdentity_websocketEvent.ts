import { getQpqConfig } from './lambda-utils';
import { getApiGatwayEventWebsocketWithIdentity_websocketEvent } from '../lambdaHandlers';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const apiGatwayEventWebsocketWithIdentity_websocketEvent = getApiGatwayEventWebsocketWithIdentity_websocketEvent(
  dynamicModuleLoader,
  getQpqConfig(),
);
