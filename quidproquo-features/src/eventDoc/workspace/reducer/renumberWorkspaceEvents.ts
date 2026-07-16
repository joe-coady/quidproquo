import { EventDocEvent } from '../../models';

// Re-stamp metadata.index sequentially from `startIndex`, so pending indexes continue
// the saved log after any coalesce removal. Provisional only: the backend re-stamps
// the real index on save.
export const renumberWorkspaceEvents = (events: EventDocEvent[], startIndex: number): EventDocEvent[] =>
  events.map((event, offset) => ({
    ...event,
    payload: {
      ...event.payload,
      metadata: {
        ...event.payload.metadata,
        index: startIndex + offset,
      },
    },
  }));
