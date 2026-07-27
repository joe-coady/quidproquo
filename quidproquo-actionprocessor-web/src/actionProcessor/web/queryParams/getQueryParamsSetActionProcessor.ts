import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { QueryParamsActionType, QueryParamsSetActionProcessor } from 'quidproquo-web';

const getProcessQueryParamsSet = (qpqConfig: QPQConfig): QueryParamsSetActionProcessor => {
  return async ({ key, values, createHistoryEntry }) => {
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);

    // Replace every existing value for the key; no values means remove it.
    urlParams.delete(key);
    values.forEach((value) => urlParams.append(key, value));

    // Only the query changes: keep the hash, and drop the '?' when no params remain.
    const search = urlParams.toString();
    const newUrl = `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;

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
