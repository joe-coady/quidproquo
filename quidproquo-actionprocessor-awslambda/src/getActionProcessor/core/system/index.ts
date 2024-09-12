import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getSystemExecuteStoryActionProcessor } from './getSystemExecuteStoryActionProcessor';

export const getSystemActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getSystemExecuteStoryActionProcessor(qpqConfig, dynamicModuleLoader)),
});
