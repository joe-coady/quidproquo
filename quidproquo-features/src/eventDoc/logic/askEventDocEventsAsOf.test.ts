import { KeyValueStoreActionType, QpqIsoDateTime, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { eventDocEventsStoreName } from '../constants/eventDocEventsStoreName';
import { askEventDocProvideStore } from '../context/askEventDocProvideStore';
import { EventDocEvent } from '../models';
import { EventDocStoredEvent } from '../types/EventDocStoredEvent';
import { askEventDocEventsAsOf } from './askEventDocEventsAsOf';

// This is the "as you would have seen it then" resolver: a Latest link renders its target as of the
// moment the referrer was published. It deliberately does NOT consult the target's versions — an
// unpublished draft is still what renders — so the tests pin that a doc with no published version
// resolves fine, and that only the time bound cuts the log.

const DOC_ID = 'doc-1';
const STORE_NAME = 'content';
const EVENTS_STORE_NAME = eventDocEventsStoreName(STORE_NAME);

const buildEvent = (index: number, createdAt: string): EventDocEvent => ({
  type: 'SET_BODY',
  payload: {
    data: { body: `body-${index}` },
    metadata: {
      version: 1,
      clientMessageId: `msg-${index}`,
      createdBy: { userId: 'user-1' } as EventDocEvent['payload']['metadata']['createdBy'],
      createdAt: createdAt as QpqIsoDateTime,
      index,
    },
  },
});

// A doc edited across four months. No PUBLISH event anywhere — it has never been published.
const EVENTS: EventDocEvent[] = [
  buildEvent(0, '2026-02-01T00:00:00.000Z'),
  buildEvent(1, '2026-04-10T00:00:00.000Z'),
  buildEvent(2, '2026-05-01T00:00:00.000Z'),
  buildEvent(3, '2026-06-20T00:00:00.000Z'),
];

const storedEvents: EventDocStoredEvent[] = EVENTS.map((event) => ({
  pk: DOC_ID,
  sk: event.payload.metadata.index,
  data: event,
}));

const eventsAsOf = (clock: string): EventDocEvent[] =>
  runStory(askEventDocProvideStore({ storeName: STORE_NAME, type: 'content' }, askEventDocEventsAsOf(DOC_ID, clock as QpqIsoDateTime)), {
    [KeyValueStoreActionType.Query]: (action: { payload: { keyValueStoreName: string } }) => {
      if (action.payload.keyValueStoreName !== EVENTS_STORE_NAME) {
        throw new Error(`Unexpected store read: ${action.payload.keyValueStoreName}`);
      }
      return { items: storedEvents, nextPageKey: undefined };
    },
  });

const indexesAsOf = (clock: string): number[] => eventsAsOf(clock).map((event) => event.payload.metadata.index);

describe('askEventDocEventsAsOf', () => {
  it('returns the events stamped at or before the clock, for a doc that was never published', () => {
    // The referring template published 2026-05-01, so the June edit must not leak in.
    expect(indexesAsOf('2026-05-01T00:00:00.000Z')).toEqual([0, 1, 2]);
  });

  it('includes an event stamped exactly at the clock', () => {
    // The bound is inclusive: an edit made at the publish instant is part of what the author saw.
    expect(indexesAsOf('2026-04-10T00:00:00.000Z')).toEqual([0, 1]);
  });

  it('returns the whole log when the clock is after every event', () => {
    expect(indexesAsOf('2026-07-15T00:00:00.000Z')).toEqual([0, 1, 2, 3]);
  });

  it('returns nothing when the clock predates the doc', () => {
    expect(indexesAsOf('2026-01-01T00:00:00.000Z')).toEqual([]);
  });
});
