import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getLogCreateActionProcessor } from './getLogCreateActionProcessor';

export const getLogActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getLogCreateActionProcessor(qpqConfig)),
});
