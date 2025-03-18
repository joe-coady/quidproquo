import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { SharedQueryParamsEffect, SharedQueryParamsSetParamEffect } from './sharedQueryParamsTypes';

export function* askSharedQueryParamsUISetParam(key: string, value: string): AskResponse<void> {
  yield* askStateDispatchEffect<SharedQueryParamsSetParamEffect>(SharedQueryParamsEffect.SetParam, {
    key,
    value,
  });
}
