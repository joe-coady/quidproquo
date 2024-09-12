import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getSystemExecuteStoryActionProcessor } from './getSystemExecuteStoryActionProcessor';

export const getSystemActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getSystemExecuteStoryActionProcessor(qpqConfig)),
});
