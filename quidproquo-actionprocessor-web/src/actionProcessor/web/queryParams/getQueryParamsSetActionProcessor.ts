import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { QueryParamsActionType, QueryParamsSetActionProcessor } from 'quidproquo-web';

const getProcessQueryParamsSet = (qpqConfig: QPQConfig): QueryParamsSetActionProcessor => {
  return async ({ key, value, createHistoryEntry }) => {
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);

    if (value === undefined || value === null || value === '') {
      urlParams.delete(key);
    } else {
      urlParams.set(key, value);
    }

    const newUrl = `${url.pathname}?${urlParams.toString()}`;

    if (createHistoryEntry) {
      window.history.pushState(null, '', newUrl);
    } else {
      window.history.replaceState(null, '', newUrl);
    }

    return actionResult(void 0);
  };
};

export const getQueryParamsSetActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [QueryParamsActionType.Set]: getProcessQueryParamsSet(qpqConfig),
});
