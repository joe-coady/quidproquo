import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getAiPromptActionProcessor } from './getAiPromptActionProcessor';

export const getAiActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getAiPromptActionProcessor(qpqConfig, dynamicModuleLoader)),
});
