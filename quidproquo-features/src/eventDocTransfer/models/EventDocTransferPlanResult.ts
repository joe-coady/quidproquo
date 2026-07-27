import { EventDocBundleSource } from './EventDocBundleSource';
import { EventDocTransferPlanRow } from './EventDocTransferPlanRow';

// What POST /transfer/plan answers: the rows plus where the bundle came from, so the review screen
// can say "from dev, exported 20 minutes ago" without a second call.
export type EventDocTransferPlanResult = {
  source: EventDocBundleSource;
  rows: EventDocTransferPlanRow[];
};
