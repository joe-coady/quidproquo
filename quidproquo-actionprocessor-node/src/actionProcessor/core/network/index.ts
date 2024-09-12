import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getNetworkRequestActionProcessor } from './getNetworkRequestActionProcessor';

export const getNetworkActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getNetworkRequestActionProcessor(qpqConfig)),
});
