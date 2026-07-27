import { Nullable } from 'quidproquo-core';

import { EventDocBundleSource, EventDocTransferPlanRow } from '../../models';

// The import screen. One `rows` list serves both phases: the plan fills it with what WOULD happen,
// and the apply overwrites it with what DID, which is why the plan and the report render identically.
// `isApplied` is what tells the view which of the two it is looking at.
export type EventDocImportUiState = {
  transferId: Nullable<string>;
  source: Nullable<EventDocBundleSource>;
  rows: EventDocTransferPlanRow[];
  isLoading: boolean;
  isApplying: boolean;
  isApplied: boolean;
  error: Nullable<string>;
};

export const createInitialEventDocImportUiState = (): EventDocImportUiState => ({
  transferId: null,
  source: null,
  rows: [],
  isLoading: false,
  isApplying: false,
  isApplied: false,
  error: null,
});
