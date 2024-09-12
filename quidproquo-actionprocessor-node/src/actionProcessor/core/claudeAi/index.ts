import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getClaudeAiMessagesApiActionProcessor } from './getClaudeAiMessagesApiActionProcessor';

export const getClaudeAiActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getClaudeAiMessagesApiActionProcessor(qpqConfig, dynamicModuleLoader)),
});
