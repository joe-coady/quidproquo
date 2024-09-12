import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getConfigGetApplicationInfoActionProcessor } from './getConfigGetApplicationInfoActionProcessor';

export const getConfigActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getConfigGetApplicationInfoActionProcessor(qpqConfig)),
});
