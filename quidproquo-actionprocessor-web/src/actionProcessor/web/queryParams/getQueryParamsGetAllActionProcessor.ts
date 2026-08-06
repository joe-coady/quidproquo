import { actionResult, createActionProcessor, ProcessorFor, QPQConfig } from 'quidproquo-core';
import { askQueryParamsGetAll, QueryParamsActionType } from 'quidproquo-web';

const getProcessQueryParamsGetAll = (qpqConfig: QPQConfig): ProcessorFor<typeof askQueryParamsGetAll> => {
  return async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramsObject: Record<string, string[]> = {};

    urlParams.forEach((value, key) => {
      paramsObject[key] = [...(paramsObject[key] ?? []), value];
    });

    return actionResult(paramsObject);
  };
};

export const getQueryParamsGetAllActionProcessor = createActionProcessor(askQueryParamsGetAll, getProcessQueryParamsGetAll);
