import { AskResponse } from 'quidproquo-core';

import { EventDocEvent } from '../models';
import { askEventDocEventList } from './askEventDocEventList';

// Page through the whole event log (ascending) and return it flat — the complete history
// a from-scratch fold needs. The append-time validator uses this; until state snapshots
// exist it re-reads the full log per validated append.
export function* askEventDocEventListAll(
  modelId: string
): AskResponse<EventDocEvent[]> {
  const events: EventDocEvent[] = [];
  let nextPageKey: string | undefined;

  do {
    const page = yield* askEventDocEventList(modelId, { nextPageKey });
    events.push(...page.items);
    nextPageKey = page.nextPageKey;
  } while (nextPageKey);

  return events;
}
