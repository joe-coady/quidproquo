import { EventDocEventPayload } from '../../../../eventDoc/models/EventDocEventPayload';
import { MaintenanceRemoveUpdateData } from '../effects/MaintenanceRemoveUpdateEffect';
import { deriveMaintenanceCurrentState } from '../logic/deriveMaintenanceCurrentState';
import { MaintenanceState } from '../MaintenanceState';

// Removing an entry re-derives — deleting the newest update rolls the whole
// current state (status line, level, clock) back to the one before it.
export const removeUpdate = (state: MaintenanceState, { data }: EventDocEventPayload<MaintenanceRemoveUpdateData>): MaintenanceState =>
  deriveMaintenanceCurrentState({ ...state, updates: state.updates.filter((update) => update.id !== data.updateId) });
