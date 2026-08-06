import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  askNetworkRequestBase,
  createActionProcessor,
  ProcessorFor,
  QPQConfig,
} from 'quidproquo-core';
import { executeNetworkRequest } from 'quidproquo-webserver';

const getProcessNetworkRequest = (qpqConfig: QPQConfig): ProcessorFor<typeof askNetworkRequestBase> => {
  return async (payload) => {
    try {
      return actionResult(await executeNetworkRequest(payload));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AbortError: () => actionResultError(askNetworkRequestBase.errorType.Timeout, 'Network request timed out'),
      });
    }
  };
};

export const getNetworkRequestActionProcessor = createActionProcessor(askNetworkRequestBase, getProcessNetworkRequest);
