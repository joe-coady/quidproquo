import {
  ConfigActionType,
  KeyValueStoreActionType,
  KvsQueryOperation,
  KvsStreamEventType,
  KvsStreamRecord,
  runStory,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { eventDocEventsStoreName } from '../../constants/eventDocEventsStoreName';
import { EVENT_DOC_STORE_NAME_GLOBAL } from '../../constants/eventDocGlobalNames';
import { EventDocEffect, EventDocEvent } from '../../models';
import { createKvsUpdateMock } from '../../testing/kvsUpdateActionMock';
import { projectEventDocSummary } from './eventDocSummaryProjector';

// The projector is what makes the summary a projection rather than a second source of truth,
// so what matters here is that it rebuilds the RIGHT record: the right document, in the right
// tenant scope, under the right collection type.

const STORE = 'test-templates';
const SCOPE_DELIMITER = '@@QPQSCOPE@@';

const eventId = (n: number): string => String(n).padStart(4, '0');

const event = (type: string, index: number, data: unknown): EventDocEvent => ({
  type,
  payload: {
    data,
    metadata: {
      version: 1,
      clientMessageId: `msg-${index}`,
      createdBy: { userId: 'user-1', userDisplayName: 'User One' },
      createdAt: `2026-07-29T00:00:0${index}.000Z` as EventDocEvent['payload']['metadata']['createdAt'],
      eventId: eventId(index),
    },
  },
});

const LOG: EventDocEvent[] = [
  event(EventDocEffect.InitState, 0, { id: 'doc-1', code: 'tpl-1', name: 'Template One' }),
  event(EventDocEffect.SetName, 1, { name: 'Renamed' }),
];

type Row = Record<string, unknown>;

const buildMocks = (streamPk: string, type = 'template') => {
  const tables: Record<string, Row[]> = {};
  const updates: { key: unknown; scope?: string }[] = [];

  // The log as the events table actually holds it: pk composed with the scope, and the
  // collection type denormalised onto every row.
  tables[eventDocEventsStoreName(STORE)] = LOG.map((e) => ({
    pk: streamPk,
    sk: e.payload.metadata.eventId,
    type,
    data: e,
  }));

  const mocks = {
    [ConfigActionType.GetGlobal]: (action: { payload: { globalName: string } }) =>
      action.payload.globalName === EVENT_DOC_STORE_NAME_GLOBAL ? STORE : '',

    [KeyValueStoreActionType.Query]: (action: {
      payload: { keyValueStoreName: string; keyCondition: KvsQueryOperation; options?: { scope?: string } };
    }) => {
      const { keyValueStoreName, options } = action.payload;
      // The processor composes the scope into the pk, so the mock reproduces that: a query
      // finds rows whose stored pk matches the scope it was issued under.
      const wantPk = options?.scope ? `${options.scope}${SCOPE_DELIMITER}doc-1` : 'doc-1';
      const items = (tables[keyValueStoreName] ?? []).filter((row) => row.pk === wantPk);

      return { items: [...items].sort((a, b) => String(a.sk).localeCompare(String(b.sk))), nextPageKey: undefined };
    },

    [KeyValueStoreActionType.Update]: (action: {
      payload: { keyValueStoreName: string; key: unknown; sortKey?: unknown; updates: any; options?: { scope?: string } };
    }) => {
      updates.push({ key: action.payload.key, scope: action.payload.options?.scope });
      return createKvsUpdateMock({
        tableFor: (_scope, storeName) => (tables[storeName] ??= []),
        keyName: 'type',
        sortKeyName: 'id',
      })(action as any);
    },
  };

  return { mocks, tables, updates };
};

// Shaped as the action processor hands them over: keys already raw, scope alongside.
const streamRecord = (scope: string | undefined, type = 'template'): KvsStreamRecord => ({
  keyValueStoreName: eventDocEventsStoreName(STORE),
  eventType: KvsStreamEventType.Insert,
  scope,
  keys: { pk: 'doc-1', sk: eventId(1) },
  newImage: { pk: 'doc-1', sk: eventId(1), type, data: LOG[1] } as any,
});

describe('projectEventDocSummary', () => {
  it('rebuilds the summary from the log, folding the whole thing', () => {
    const { mocks, tables } = buildMocks('doc-1');

    runStory(projectEventDocSummary(streamRecord(undefined)), mocks);

    const record = (tables[STORE] ?? []).find((row) => row.id === 'doc-1');
    expect(record).toBeDefined();
    // SET_NAME is folded, so the projection reflects the log rather than only INIT.
    expect(record!.name).toBe('Renamed');
    expect(record!.code).toBe('tpl-1');
  });

  it('re-enters the scope the record carries', () => {
    // Without this the rebuild would read an empty log and write into the unscoped partition.
    const { mocks, updates, tables } = buildMocks(`tenant-a${SCOPE_DELIMITER}doc-1`);

    runStory(projectEventDocSummary(streamRecord('tenant-a')), mocks);

    expect(updates).toHaveLength(1);
    expect(updates[0].scope).toBe('tenant-a');

    const record = (tables[STORE] ?? []).find((row) => row.id === 'doc-1');
    expect(record!.name).toBe('Renamed');
  });

  it('takes the collection type off the row, not from config', () => {
    // One events table can host several collections, so the type cannot come from a global.
    const { mocks, updates } = buildMocks('doc-1', 'layout');

    runStory(projectEventDocSummary(streamRecord(undefined, 'layout')), mocks);

    expect(updates[0].key).toBe('layout');
  });

  it('skips a record with no collection type rather than guessing one', () => {
    const { mocks, updates } = buildMocks('doc-1');

    const untyped: KvsStreamRecord = { ...streamRecord(undefined), newImage: undefined, oldImage: undefined };
    runStory(projectEventDocSummary(untyped), mocks);

    expect(updates).toHaveLength(0);
  });
});
