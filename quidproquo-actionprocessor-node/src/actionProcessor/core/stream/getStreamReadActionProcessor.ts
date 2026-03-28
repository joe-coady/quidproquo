import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  StreamActionType,
  StreamReadActionProcessor,
} from 'quidproquo-core';

const getProcessStreamRead = (qpqConfig: QPQConfig): StreamReadActionProcessor => {
  return async ({ streamId, noWait }, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const chunk = await streamRegistry.read(streamId, noWait);
    return actionResult(chunk);
  };
};

export const getStreamReadActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [StreamActionType.Read]: getProcessStreamRead(qpqConfig),
});
