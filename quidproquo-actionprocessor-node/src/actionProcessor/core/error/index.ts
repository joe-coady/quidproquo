import { QPQConfig, ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader } from 'quidproquo-core';

import { getErrorThrowErrorActionProcessor } from './getErrorThrowErrorActionProcessor';

export const getErrorActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getErrorThrowErrorActionProcessor(qpqConfig, dynamicModuleLoader)),
});
