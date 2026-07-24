import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../../eventDoc/actions/eventDocEvent/EventDocApplyEventActionRequester';
import { MaintenanceAddUpdateEffect } from '../effects/MaintenanceAddUpdateEffect';
import { MaintenanceEffect } from '../effects/MaintenanceEffect';
import { MaintenanceUpdateData } from '../effects/MaintenanceUpdateData';

export function* askMaintenanceAddUpdate(update: MaintenanceUpdateData): AskResponse<void> {
  yield* askApplyEventDocEvent<MaintenanceAddUpdateEffect>(MaintenanceEffect.AddUpdate, update);
}
