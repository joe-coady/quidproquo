import { QPQError } from 'quidproquo-core';

import { EventDocWorkspaceSlotOperation } from './EventDocWorkspaceSlotOperation';

// A slot error keeps the full QPQError (typed, not flattened to a string) plus the
// operation it came from, so consumers can branch on errorType and phrase per
// operation instead of parsing display strings.
export type EventDocWorkspaceSlotError = {
  operation: EventDocWorkspaceSlotOperation;
  error: QPQError;
};
