import { Nullable, QpqPagedData } from 'quidproquo-core';

import { EventDocEvent } from './EventDocEvent';
import { EventDocSnapshotBase } from './EventDocSnapshotBase';

// One page of events plus the fold base they follow from — the listEvents response when
// the caller asks for `includeBase`. A null base means no usable snapshot existed and the
// page starts at the beginning of the log: the fallback is carried in-band so a client
// never needs a second request shape.
export type EventDocEventBootstrapPage = QpqPagedData<EventDocEvent> & {
  base: Nullable<EventDocSnapshotBase>;
};
