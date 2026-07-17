import { askCatch, AskResponse } from 'quidproquo-core';

import { askUIEventDocListSetError } from '../actionCreators/askUIEventDocListSetError';
import { askUIEventDocListSetItems } from '../actionCreators/askUIEventDocListSetItems';
import { askUIEventDocListSetLoading } from '../actionCreators/askUIEventDocListSetLoading';
import { askEventDocListFetch } from '../transport/askEventDocListFetch';

export function* askEventDocListLoad(serviceName: string, basePath: string): AskResponse<void> {
  yield* askUIEventDocListSetLoading(true);
  yield* askUIEventDocListSetError(null);

  const result = yield* askCatch(askEventDocListFetch(serviceName, basePath), askUIEventDocListSetLoading(false));

  if (!result.success) {
    yield* askUIEventDocListSetError('Failed to load items.');
    yield* askUIEventDocListSetLoading(false);
    return;
  }

  yield* askUIEventDocListSetItems(result.result);
  yield* askUIEventDocListSetLoading(false);
}
