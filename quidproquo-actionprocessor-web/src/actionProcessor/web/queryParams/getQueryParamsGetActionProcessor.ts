import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { QueryParamsActionType, QueryParamsGetActionProcessor } from 'quidproquo-web';

const getProcessQueryParamsGet = (qpqConfig: QPQConfig): QueryParamsGetActionProcessor => {
  return async ({ key }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(key) || undefined;

    return actionResult(value);
  };
};

export const getQueryParamsGetActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [QueryParamsActionType.Get]: getProcessQueryParamsGet(qpqConfig),
});
