import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocImportUiEffect } from '../effects/EventDocImportUiEffect';
import type { EventDocImportUiSetLoadingEffect } from '../effects/EventDocImportUiSetLoadingEffect';

export function* askUIEventDocImportSetLoading(isLoading: boolean): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocImportUiSetLoadingEffect>(EventDocImportUiEffect.SetLoading, { isLoading });
}
