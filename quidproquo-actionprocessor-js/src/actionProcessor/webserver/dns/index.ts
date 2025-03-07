import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getDnsListActionProcessor } from './getDnsListActionProcessor';

export const getDnsActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getDnsListActionProcessor(qpqConfig, dynamicModuleLoader)),
});
