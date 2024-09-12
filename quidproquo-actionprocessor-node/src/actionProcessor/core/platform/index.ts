import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getPlatformDelayActionProcessor } from './getPlatformDelayActionProcessor';

export const getPlatformActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getPlatformDelayActionProcessor(qpqConfig)),
});
