import { EventDocEvent } from '../../eventDoc/models';
import { EventDocBundleAsset } from './EventDocBundleAsset';
import { EventDocDocRef } from './EventDocDocRef';

// One doc in a bundle: its complete event log, verbatim, plus its asset bytes. NO summary:
// the summary is derived by folding the log (foldEventDocSummary), so nothing derived crosses
// environments and an import cannot carry a stale read model.
export type EventDocBundleDoc = EventDocDocRef & {
  events: EventDocEvent[];
  assets: EventDocBundleAsset[];
};
