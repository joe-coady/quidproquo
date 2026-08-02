import { AskResponse } from 'quidproquo-core';

import { EventDocEvent, EventDocEventInput } from '../../models';
import { EventDocWorkspaceBootstrap } from './EventDocWorkspaceBootstrap';
import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';

// How the workspace reaches the event-doc backend. Injected rather than hard-wired:
// this package can't depend on a specific HTTP client, so the web app passes stories
// built on askApiRequest, tests pass fakes, other hosts bring their own.
// `askFetchBootstrap` is the opening load: the newest snapshot base plus only the
// events after it (base: null + full log when the server has no usable snapshot).
// `askFetchEvents` with `afterEventId` (exclusive) returns only the tail, keeping
// refresh incremental; without it, the whole log — the history dialog's full read.
export type EventDocWorkspaceTransport = {
  askFetchBootstrap: (identity: EventDocWorkspaceDocumentIdentity) => AskResponse<EventDocWorkspaceBootstrap>;
  askFetchEvents: (identity: EventDocWorkspaceDocumentIdentity, afterEventId?: string) => AskResponse<EventDocEvent[]>;
  askAppendEvent: (identity: EventDocWorkspaceDocumentIdentity, input: EventDocEventInput) => AskResponse<EventDocEvent>;
};
