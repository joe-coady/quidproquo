import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { QueryParamsActionType, QueryParamsGetAllActionProcessor } from 'quidproquo-web';

const getProcessQueryParamsGetAll = (qpqConfig: QPQConfig): QueryParamsGetAllActionProcessor => {
  return async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramsObject: Record<string, string[]> = {};

    urlParams.forEach((value, key) => {
      if (paramsObject[key]) {
        paramsObject[key] = [...(paramsObject[key] as string[]), value];
      } else {
        paramsObject[key] = [value];
      }
    });

    return actionResult(paramsObject);
  };
};

export const getQueryParamsGetAllActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [QueryParamsActionType.GetAll]: getProcessQueryParamsGetAll(qpqConfig),
});
