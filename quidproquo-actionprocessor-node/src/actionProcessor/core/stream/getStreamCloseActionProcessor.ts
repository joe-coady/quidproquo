import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  StreamActionType,
  StreamCloseActionProcessor,
} from 'quidproquo-core';

const getProcessStreamClose = (qpqConfig: QPQConfig): StreamCloseActionProcessor => {
  return async ({ streamId }, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    streamRegistry.close(streamId);
    return actionResult(undefined);
  };
};

export const getStreamCloseActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [StreamActionType.Close]: getProcessStreamClose(qpqConfig),
});
