import { askDelay, AskResponse } from 'quidproquo-core';

import { askSharedQueryParamsUISetParam } from '../sharedQueryParamsActionCreator';

export function* askSetParam(key: string, value: string): AskResponse<void> {
  // TODO: Implement this function
  yield* askSharedQueryParamsUISetParam(key, value);
}
