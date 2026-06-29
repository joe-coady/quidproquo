import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  NetworkActionType,
  NetworkRequestActionProcessor,
  QPQConfig,
} from 'quidproquo-core';
import { executeNetworkRequest } from 'quidproquo-webserver';

const getProcessNetworkRequest = (qpqConfig: QPQConfig): NetworkRequestActionProcessor<any, any> => {
  return async (payload) => {
    console.log(payload.url);

    try {
      return actionResult(await executeNetworkRequest(payload));
    } catch (err: any) {
      console.log(err);
      return actionResultError(ErrorTypeEnum.GenericError, err.stack);
    }
  };
};

export const getNetworkRequestActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [NetworkActionType.Request]: getProcessNetworkRequest(qpqConfig),
});
