import { getWebEntryActionProcessor } from './webEntry';
import { getServiceFunctionActionProcessor } from './serviceFunction';
import { getWebsocketActionProcessor } from './websocket';

export * from './webEntry';
export * from './serviceFunction';
export * from './websocket';

import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

export const getWebserverActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getWebEntryActionProcessor(qpqConfig)),
  ...(await getServiceFunctionActionProcessor(qpqConfig)),
  ...(await getWebsocketActionProcessor(qpqConfig)),
});
