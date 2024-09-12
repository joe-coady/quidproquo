import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getSystemBatchActionProcessor } from './getSystemBatchActionProcessor';

export const getSystemActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getSystemBatchActionProcessor(qpqConfig)),
});
