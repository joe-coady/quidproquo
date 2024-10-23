import { ActionProcessorList, ActionProcessorListResolver, actionResult,GuidActionType, GuidNewActionProcessor, QPQConfig } from 'quidproquo-core';
import { v4 as uuidV4 } from 'uuid';

const getProcessGuidNew = (qpqConfig: QPQConfig): GuidNewActionProcessor => {
  return async () => {
    return actionResult(uuidV4());
  };
};

export const getGuidNewActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [GuidActionType.New]: getProcessGuidNew(qpqConfig),
});
