import { DateActionType, GuidActionType, KeyValueStoreActionType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { eventDocEventsStoreName } from '../constants/eventDocEventsStoreName';
import { askEventDocProvideStore } from '../context/askEventDocProvideStore';
import { EventDocStoreOptions } from '../context/buildEventDocStore';
import { EventDocEffect, EventDocEventActor, EventDocServerEventInput } from '../models';
import { askEventDocAppendServerEvents } from './askEventDocAppendServerEvents';

// The batch append's load-bearing guarantees live in this composition, not in the
// primitives it calls: input order = mint order = log order, ONE shared createdAt,
// clientMessageId reusing the event's own id, the empty-input zero-action
// short-circuit, and the loud rejection of hook stores / Publish effects (the two
// things a batch would silently skip).

const DOC_ID = 'doc-1';
const NOW = '2026-08-03T00:00:00.000Z';
const ACTOR = { userId: 'user-1' } as EventDocEventActor;

const STORE: EventDocStoreOptions = { storeName: 'test-instances', type: 'flowInstance' };

const INPUTS: EventDocServerEventInput[] = [
  { type: 'RUN_STARTED', data: { at: '2026-08-03T00:00:00.100Z' }, version: 3 },
  { type: 'NODE_ENTERED', data: { at: '2026-08-03T00:00:00.200Z' }, version: 3 },
  { type: 'RUN_COMPLETED', data: { at: '2026-08-03T00:00:00.300Z' }, version: 3 },
];

const buildMocks = () => {
  const upserts: { keyValueStoreName: string; items: any[]; options?: { scope?: string } }[] = [];
  const counts = { dateNow: 0, guidMints: 0 };

  const mocks = {
    [DateActionType.Now]: () => {
      counts.dateNow += 1;
      return NOW;
    },
    [GuidActionType.NewSortableMany]: (action: { payload: { count: number } }) => {
      counts.guidMints += 1;
      // Sortable ids only need to sort in mint order; padded counters do.
      return Array.from({ length: action.payload.count }, (_, index) => `sguid-${String(index).padStart(4, '0')}`);
    },
    [KeyValueStoreActionType.UpsertMany]: (action: { payload: (typeof upserts)[number] }) => {
      upserts.push(action.payload);
      return undefined;
    },
  };

  return { mocks, upserts, counts };
};

const runAppend = (inputs: EventDocServerEventInput[], store: EventDocStoreOptions, mocks: object) =>
  runStory(askEventDocProvideStore(store, askEventDocAppendServerEvents(DOC_ID, inputs, ACTOR)), mocks);

describe('askEventDocAppendServerEvents', () => {
  it('lands the whole burst in one write: input order = id order, shared createdAt, clientMessageId = eventId', () => {
    const { mocks, upserts, counts } = buildMocks();

    const events = runAppend(INPUTS, STORE, mocks);

    expect(events.map((event) => event.type)).toEqual(['RUN_STARTED', 'NODE_ENTERED', 'RUN_COMPLETED']);
    expect(events.map((event) => event.payload.metadata.eventId)).toEqual(['sguid-0000', 'sguid-0001', 'sguid-0002']);
    expect(events.every((event) => event.payload.metadata.createdAt === NOW)).toBe(true);
    expect(events.every((event) => event.payload.metadata.clientMessageId === event.payload.metadata.eventId)).toBe(true);

    // One clock read, one id mint, one write — the whole point of the batch.
    expect(counts).toEqual({ dateNow: 1, guidMints: 1 });
    expect(upserts).toHaveLength(1);
    expect(upserts[0].keyValueStoreName).toBe(eventDocEventsStoreName(STORE.storeName));
    expect(upserts[0].items.map((item: { pk: string; sk: string }) => [item.pk, item.sk])).toEqual([
      [DOC_ID, 'sguid-0000'],
      [DOC_ID, 'sguid-0001'],
      [DOC_ID, 'sguid-0002'],
    ]);
  });

  it('short-circuits an empty batch with zero actions', () => {
    const { mocks, upserts, counts } = buildMocks();

    const events = runAppend([], STORE, mocks);

    expect(events).toEqual([]);
    expect(counts).toEqual({ dateNow: 0, guidMints: 0 });
    expect(upserts).toHaveLength(0);
  });

  it('rejects a store with hooks loudly - a batch would silently skip them', () => {
    const { mocks } = buildMocks();

    expect(() => runAppend(INPUTS, { ...STORE, onAppend: 'syncReadModel' }, mocks)).toThrow(/onAppend\/onPublish hooks/);
    expect(() => runAppend(INPUTS, { ...STORE, onPublish: 'syncTenantRecord' }, mocks)).toThrow(/onAppend\/onPublish hooks/);
  });

  it('rejects a Publish effect in the batch - the publish hook path must stay per-event', () => {
    const { mocks } = buildMocks();

    const withPublish: EventDocServerEventInput[] = [...INPUTS, { type: EventDocEffect.Publish, data: {}, version: 3 }];

    expect(() => runAppend(withPublish, STORE, mocks)).toThrow(/cannot batch a Publish/);
  });
});
