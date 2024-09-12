import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

export const getWebserverActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  // Nothing yet
});
