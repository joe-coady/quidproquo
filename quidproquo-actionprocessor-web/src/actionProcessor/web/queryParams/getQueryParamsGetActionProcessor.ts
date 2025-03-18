import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { QueryParamsActionType, QueryParamsGetActionProcessor } from 'quidproquo-web';

const getProcessQueryParamsGet = (qpqConfig: QPQConfig): QueryParamsGetActionProcessor => {
  return async ({ key }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const values = urlParams.getAll(key);

    return actionResult(values);
  };
};

export const getQueryParamsGetActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [QueryParamsActionType.Get]: getProcessQueryParamsGet(qpqConfig),
});
