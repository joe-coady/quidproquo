import { getExtractActionProcessor } from './extract';
import { getServiceFunctionActionProcessor } from './serviceFunction';
import { getWebEntryActionProcessor } from './webEntry';
import { getWebsocketActionProcessor } from './websocket';

export * from './extract';
export * from './serviceFunction';
export * from './webEntry';
export * from './websocket';

import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

export const getWebserverActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getExtractActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getWebEntryActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getServiceFunctionActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getWebsocketActionProcessor(qpqConfig, dynamicModuleLoader)),
});
