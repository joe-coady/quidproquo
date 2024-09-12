import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

export const getLambdaActionProcessors: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => {
  return {};
};
