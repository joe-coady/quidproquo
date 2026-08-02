import { AskResponse } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceBootstrap } from '../types/EventDocWorkspaceBootstrap';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { askEventDocWorkspaceApiFetchBootstrapPage } from './askEventDocWorkspaceApiFetchBootstrapPage';
import { askEventDocWorkspaceApiFetchEventsPage } from './askEventDocWorkspaceApiFetchEventsPage';

// Fetches a document's opening load: the newest snapshot base plus the events after
// it, following pagination in order. The base rides only the first page; follow-up
// pages go through the plain events page pinned to the SAME base (afterEventId =
// base.eventId), so a snapshot written mid-load can't shift the page boundaries.
// This is the EventDocWorkspaceTransport.askFetchBootstrap shape.
export function* askEventDocWorkspaceApiFetchBootstrap(identity: EventDocWorkspaceDocumentIdentity): AskResponse<EventDocWorkspaceBootstrap> {
  const firstPage = yield* askEventDocWorkspaceApiFetchBootstrapPage(identity);

  const events: EventDocEvent[] = [...firstPage.items];
  let nextPageKey = firstPage.nextPageKey;

  while (nextPageKey) {
    const page = yield* askEventDocWorkspaceApiFetchEventsPage(identity, nextPageKey, firstPage.base?.eventId);
    events.push(...page.items);
    nextPageKey = page.nextPageKey;
  }

  return { base: firstPage.base, events };
}
