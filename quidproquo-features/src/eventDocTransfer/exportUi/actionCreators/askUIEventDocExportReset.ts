import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocExportUiEffect } from '../effects/EventDocExportUiEffect';
import type { EventDocExportUiResetEffect } from '../effects/EventDocExportUiResetEffect';

export function* askUIEventDocExportReset(): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocExportUiResetEffect>(EventDocExportUiEffect.Reset, {});
}
