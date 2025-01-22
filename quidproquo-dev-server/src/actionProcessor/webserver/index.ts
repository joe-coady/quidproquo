import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getServiceFunctionActionProcessor } from './serviceFunctionOverride';
import { getWebsocketActionProcessor } from './websocket';

export const getWebserverActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getServiceFunctionActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getWebsocketActionProcessor(qpqConfig, dynamicModuleLoader)),
});
