import {
  ActionProcessorList,
  ActionProcessorListResolver,
  PlatformActionType,
  PlatformDelayActionProcessor,
  QPQConfig,
  actionResult,
} from 'quidproquo-core';

const getProcessPlatformDelay = (qpqConfig: QPQConfig): PlatformDelayActionProcessor => {
  return async ({ timeMs }) => {
    return new Promise((resolve) => setTimeout(() => resolve(actionResult(undefined)), timeMs));
  };
};

export const getPlatformDelayActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [PlatformActionType.Delay]: getProcessPlatformDelay(qpqConfig),
});