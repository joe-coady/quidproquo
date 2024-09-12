import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getDateNowActionProcessor } from './getDateNowActionProcessor';

export const getDateActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getDateNowActionProcessor(qpqConfig)),
});
