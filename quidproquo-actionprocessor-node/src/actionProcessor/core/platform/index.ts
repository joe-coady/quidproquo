import { QPQConfig, ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader } from 'quidproquo-core';

import { getPlatformDelayActionProcessor } from './getPlatformDelayActionProcessor';

export const getPlatformActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getPlatformDelayActionProcessor(qpqConfig, dynamicModuleLoader)),
});
