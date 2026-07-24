import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../../eventDoc/actions/eventDocEvent/EventDocApplyEventActionRequester';
import { MaintenanceEffect } from '../effects/MaintenanceEffect';
import { MaintenanceRemoveUpdateEffect } from '../effects/MaintenanceRemoveUpdateEffect';

export function* askMaintenanceRemoveUpdate(updateId: string): AskResponse<void> {
  yield* askApplyEventDocEvent<MaintenanceRemoveUpdateEffect>(MaintenanceEffect.RemoveUpdate, { updateId });
}
