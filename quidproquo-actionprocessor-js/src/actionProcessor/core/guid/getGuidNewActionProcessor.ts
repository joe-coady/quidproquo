import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  generateUuid,
  GuidActionType,
  GuidNewActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

const getProcessGuidNew = (qpqConfig: QPQConfig): GuidNewActionProcessor => {
  return async () => {
    return actionResult(generateUuid());
  };
};

export const getGuidNewActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [GuidActionType.New]: getProcessGuidNew(qpqConfig),
});
