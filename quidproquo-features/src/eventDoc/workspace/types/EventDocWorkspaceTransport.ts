import { AskResponse } from 'quidproquo-core';

import { EventDocEvent, EventDocEventInput } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';

// How the workspace reaches the event-doc backend. Injected rather than hard-wired:
// this package can't depend on a specific HTTP client, so the web app passes stories
// built on askApiRequest, tests pass fakes, other hosts bring their own.
// `askFetchEvents` with `afterIndex` (exclusive) returns only the tail, keeping
// refresh incremental.
export type EventDocWorkspaceTransport = {
  askFetchEvents: (identity: EventDocWorkspaceDocumentIdentity, afterIndex?: number) => AskResponse<EventDocEvent[]>;
  askAppendEvent: (identity: EventDocWorkspaceDocumentIdentity, input: EventDocEventInput) => AskResponse<EventDocEvent>;
};
