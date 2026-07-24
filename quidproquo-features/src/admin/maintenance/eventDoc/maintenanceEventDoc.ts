import { QpqReducer } from 'quidproquo-core';

import { createEventDocDefinition } from '../../../eventDoc/definition/createEventDocDefinition';
import { EventDocEvent } from '../../../eventDoc/models/EventDocEvent';
import { MAINTENANCE_SCHEMA_VERSION } from '../constants/maintenanceConstants';
import { askMaintenanceAddUpdate } from './actionCreators/askMaintenanceAddUpdate';
import { askMaintenanceEditUpdate } from './actionCreators/askMaintenanceEditUpdate';
import { askMaintenanceRemoveUpdate } from './actionCreators/askMaintenanceRemoveUpdate';
import { maintenanceFoldReducer } from './maintenanceFoldReducer';
import { createInitialMaintenanceState, MaintenanceState } from './MaintenanceState';

// THE maintenance event doc: fold config + the doc's own verbs. Folds anywhere via
// `maintenanceEventDoc.fold(events)` — the admin editor, the broadcast hook, the
// sync-on-connect service function. The UPDATE is the only mutation (a full
// status snapshot; the current state derives from the update list). Draft =
// active maintenance, published = closed; reopening branches a new draft (the
// generic lifecycle verbs merge in).
export const maintenanceEventDoc = createEventDocDefinition({
  schemaVersion: MAINTENANCE_SCHEMA_VERSION,
  // Typed to its own effect union; speaks the generic EventDocEvent at the
  // registration boundary (same convention as every doc type).
  foldReducer: maintenanceFoldReducer as QpqReducer<MaintenanceState, EventDocEvent>,
  createInitialViewState: createInitialMaintenanceState,
  api: {
    askMaintenanceAddUpdate,
    askMaintenanceEditUpdate,
    askMaintenanceRemoveUpdate,
  },
});
