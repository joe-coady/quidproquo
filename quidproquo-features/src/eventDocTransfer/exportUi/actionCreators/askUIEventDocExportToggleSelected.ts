import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocExportUiEffect } from '../effects/EventDocExportUiEffect';
import type { EventDocExportUiToggleSelectedEffect } from '../effects/EventDocExportUiToggleSelectedEffect';

export function* askUIEventDocExportToggleSelected(id: string): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocExportUiToggleSelectedEffect>(EventDocExportUiEffect.ToggleSelected, { id });
}
