import { getWebEntryActionProcessor } from './webEntry';
import { getServiceFunctionActionProcessor } from './serviceFunction';
import { getWebsocketActionProcessor } from './websocket';

export * from './webEntry';
export * from './serviceFunction';
export * from './websocket';

import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

export const getWebserverActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getWebEntryActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getServiceFunctionActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getWebsocketActionProcessor(qpqConfig, dynamicModuleLoader)),
});
