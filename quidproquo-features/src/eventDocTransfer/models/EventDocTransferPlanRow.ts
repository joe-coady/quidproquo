import { EventDocDocRef } from './EventDocDocRef';
import { EventDocTransferStatus } from './EventDocTransferStatus';

// One row of the import review table, and the same shape the apply reports back, so the UI
// renders one component for "what would happen" and "what happened".
export type EventDocTransferPlanRow = EventDocDocRef & {
  code: string;
  name: string;
  status: EventDocTransferStatus;
  // Log lengths behind the status, so "+3 events" is renderable without a second call.
  incomingEvents: number;
  existingEvents: number;
  // Written only by the apply pass; 0 on a plan and on any no-op status.
  eventsWritten: number;
  assetsWritten: number;
  // How many of the target's own events a forced overwrite threw away (backed up first). Always 0
  // unless the status is Overwritten.
  discardedEvents: number;
  // Why a blocking status blocks (which index diverged, which doc owns the code).
  detail?: string;
};
