import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  NetworkActionType,
  NetworkRequestActionProcessor,
  NetworkRequestErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';
import { executeNetworkRequest } from 'quidproquo-webserver';

// any: this single processor serves every request/response body type; the per-call
// generics are only meaningful at the requester, so the variance boundary needs any.
const getProcessNetworkRequest = (qpqConfig: QPQConfig): NetworkRequestActionProcessor<any, any> => {
  return async (payload) => {
    try {
      return actionResult(await executeNetworkRequest(payload));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AbortError: () => actionResultError(NetworkRequestErrorTypeEnum.Timeout, 'Network request timed out'),
      });
    }
  };
};

export const getNetworkRequestActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [NetworkActionType.Request]: getProcessNetworkRequest(qpqConfig),
});
