import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getErrorThrowErrorActionProcessor } from './getErrorThrowErrorActionProcessor';

export const getErrorActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getErrorThrowErrorActionProcessor(qpqConfig)),
});
