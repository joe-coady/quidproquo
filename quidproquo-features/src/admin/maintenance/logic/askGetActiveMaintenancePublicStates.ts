import { AskResponse } from 'quidproquo-core';

import { askEventDocEventListAll } from '../../../eventDoc/data/askEventDocEventListAll';
import { askEventDocList } from '../../../eventDoc/data/askEventDocList';
import { toEventDocListItem } from '../../../eventDoc/models/toEventDocListItem';
import { isMaintenancePubliclyVisible } from '../eventDoc/isMaintenancePubliclyVisible';
import { toMaintenancePublicState } from '../eventDoc/logic/toMaintenancePublicState';
import { maintenanceEventDoc } from '../eventDoc/maintenanceEventDoc';
import { MaintenancePublicState } from '../eventDoc/MaintenancePublicState';

// Fold every publicly visible maintenance (open draft, has updates, not
// Internal — see isMaintenancePubliclyVisible) to its public projection, newest
// first. Requires the maintenance store context (route globals or
// askEventDocProvideStore). The summary's open-draft flag pre-filters so only
// active docs pay the log-load + fold.
export function* askGetActiveMaintenancePublicStates(): AskResponse<MaintenancePublicState[]> {
  const summaries = yield* askEventDocList();

  const activeSummaries = summaries.filter((summary) => toEventDocListItem(summary).hasDraft);

  const states: MaintenancePublicState[] = [];

  for (const summary of activeSummaries) {
    const events = yield* askEventDocEventListAll(summary.id);
    const state = maintenanceEventDoc.fold(events);

    if (isMaintenancePubliclyVisible(state)) {
      states.push(toMaintenancePublicState(state));
    }
  }

  return states.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
