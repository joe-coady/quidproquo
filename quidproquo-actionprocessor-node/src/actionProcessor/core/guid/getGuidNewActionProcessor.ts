import { v4 as uuidV4 } from 'uuid';

import { ActionProcessorList, ActionProcessorListResolver, GuidActionType, GuidNewActionProcessor, QPQConfig, actionResult } from 'quidproquo-core';

const getProcessGuidNew = (qpqConfig: QPQConfig): GuidNewActionProcessor => {
  return async () => {
    return actionResult(uuidV4());
  };
};

export const getGuidNewActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [GuidActionType.New]: getProcessGuidNew(qpqConfig),
});
