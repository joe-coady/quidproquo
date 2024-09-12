import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getMathRandomNumberActionProcessor } from './getMathRandomNumberActionProcessor';

export const getMathActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getMathRandomNumberActionProcessor(qpqConfig)),
});
