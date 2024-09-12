import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getClaudeAiMessagesApiActionProcessor } from './getClaudeAiMessagesApiActionProcessor';

export const getClaudeAiActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getClaudeAiMessagesApiActionProcessor(qpqConfig)),
});
