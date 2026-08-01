import {
  ConfigActionType,
  FileActionType,
  InlineFunctionActionType,
  KeyValueStoreActionType,
  KvsLogicalOperator,
  KvsQueryCondition,
  KvsQueryOperation,
  KvsQueryOperationType,
  KvsStreamEventType,
  KvsStreamRecord,
  runStory,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { eventDocEventsStoreName } from '../../constants/eventDocEventsStoreName';
import { EVENT_DOC_SNAPSHOT_FOLDS_GLOBAL, EVENT_DOC_STORE_NAME_GLOBAL } from '../../constants/eventDocGlobalNames';
import { eventDocSnapshotsStoreName } from '../../constants/eventDocSnapshotsStoreName';
import { EventDocEffect, EventDocEvent, EventDocSnapshotFoldInput } from '../../models';
import { createKvsUpdateMock } from '../../testing/kvsUpdateActionMock';
import { EventDocStoredSnapshot } from '../../types/EventDocStoredSnapshot';
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

// Pull the sort-key ceiling out of a query's key condition, if it carries one — the mock
// applies it so a "fold the prefix" read genuinely returns the prefix.
const skCeiling = (keyCondition: KvsQueryOperation): string | undefined => {
  if ('conditions' in keyCondition) {
    return (keyCondition as KvsLogicalOperator).conditions.map(skCeiling).find((ceiling) => ceiling !== undefined);
  }

  const condition = keyCondition as KvsQueryCondition;
  return condition.key === 'sk' && condition.operation === KvsQueryOperationType.LessThanOrEqual ? String(condition.valueA) : undefined;
};

const buildMocks = (streamPk: string, type = 'template', options?: { snapshotFold?: string; log?: EventDocEvent[] }) => {
  const tables: Record<string, Row[]> = {};
  const updates: { key: unknown; scope?: string }[] = [];
  const upserts: { keyValueStoreName: string; item: Row; scope?: string }[] = [];
  const fileWrites: { drive: string; filepath: string; data: string; scope?: string }[] = [];
  const foldCalls: { functionName: string; input: EventDocSnapshotFoldInput }[] = [];

  // The log as the events table actually holds it: pk composed with the scope, and the
  // collection type denormalised onto every row.
  tables[eventDocEventsStoreName(STORE)] = (options?.log ?? LOG).map((e) => ({
    pk: streamPk,
    sk: e.payload.metadata.eventId,
    type,
    data: e,
  }));

  const mocks = {
    [ConfigActionType.GetGlobal]: (action: { payload: { globalName: string } }) => {
      if (action.payload.globalName === EVENT_DOC_STORE_NAME_GLOBAL) {
        return STORE;
      }
      if (action.payload.globalName === EVENT_DOC_SNAPSHOT_FOLDS_GLOBAL) {
        return options?.snapshotFold ? { [type]: options.snapshotFold } : {};
      }
      return '';
    },

    [KeyValueStoreActionType.Query]: (action: {
      payload: { keyValueStoreName: string; keyCondition: KvsQueryOperation; options?: { scope?: string } };
    }) => {
      const { keyValueStoreName, keyCondition, options: queryOptions } = action.payload;
      // The processor composes the scope into the pk, so the mock reproduces that: a query
      // finds rows whose stored pk matches the scope it was issued under.
      const wantPk = queryOptions?.scope ? `${queryOptions.scope}${SCOPE_DELIMITER}doc-1` : 'doc-1';
      const ceiling = skCeiling(keyCondition);
      const items = (tables[keyValueStoreName] ?? []).filter(
        (row) => row.pk === wantPk && (ceiling === undefined || String(row.sk) <= ceiling),
      );

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

    [KeyValueStoreActionType.Upsert]: (action: { payload: { keyValueStoreName: string; item: Row; options?: { scope?: string } } }) => {
      upserts.push({ keyValueStoreName: action.payload.keyValueStoreName, item: action.payload.item, scope: action.payload.options?.scope });
      (tables[action.payload.keyValueStoreName] ??= []).push(action.payload.item);
      return action.payload.item;
    },

    [FileActionType.WriteTextContents]: (action: { payload: { drive: string; filepath: string; data: string; scope?: string } }) => {
      fileWrites.push({
        drive: action.payload.drive,
        filepath: action.payload.filepath,
        data: action.payload.data,
        scope: action.payload.scope,
      });
    },

    // Stands in for the app-registered fold: echoes what it was invoked with (so the spec
    // can assert the prefix) and returns one small state per view.
    [InlineFunctionActionType.Execute]: (action: { payload: { functionName: string; payload: EventDocSnapshotFoldInput } }) => {
      foldCalls.push({ functionName: action.payload.functionName, input: action.payload.payload });
      return {
        document: { foldedEvents: action.payload.payload.events.length },
        summary: { name: 'from-fold' },
      };
    },
  };

  return { mocks, tables, updates, upserts, fileWrites, foldCalls };
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

// The snapshot half of the projector: for a collection that registered a snapshot fold,
// each delivery also stores the folded views as of the batch's newest event. Fragmentation
// comes from the stream's own coalescing — one snapshot per document per batch — so there
// is nothing to test about WHEN beyond "at the record's own event id".
describe('projectEventDocSummary snapshots', () => {
  const SNAPSHOTS_STORE = eventDocSnapshotsStoreName(STORE);
  const FOLD_FN = 'foldTemplateSnapshot';

  it('stores one row per view the fold returns, keyed at the batch newest event', () => {
    const { mocks, tables, foldCalls } = buildMocks('doc-1', 'template', { snapshotFold: FOLD_FN });

    runStory(projectEventDocSummary(streamRecord(undefined)), mocks);

    expect(foldCalls).toHaveLength(1);
    expect(foldCalls[0].functionName).toBe(FOLD_FN);
    expect(foldCalls[0].input.docId).toBe('doc-1');

    const rows = (tables[SNAPSHOTS_STORE] ?? []) as EventDocStoredSnapshot[];
    expect(rows.map((row) => row.pk).sort()).toEqual(['doc-1#document', 'doc-1#summary']);
    // sk is the SAME sortable event id the log is ordered by — the snapshot addresses the
    // exact event it captures.
    expect(rows.every((row) => row.sk === eventId(1))).toBe(true);
    expect(rows.every((row) => row.type === 'template')).toBe(true);

    const documentRow = rows.find((row) => row.pk === 'doc-1#document')!;
    expect(documentRow.data).toEqual({ type: 'inline', snapshot: { foldedEvents: 2 } });
  });

  it('folds the PREFIX up to the stream record, not the whole log', () => {
    // The batch's newest event may not be the log's newest by the time the handler runs —
    // a later append may already be in the table. The snapshot at THIS event must not
    // include it, or the row would claim a state the event id contradicts.
    const logWithLaterAppend = [...LOG, event(EventDocEffect.SetName, 2, { name: 'Renamed again' })];
    const { mocks, foldCalls } = buildMocks('doc-1', 'template', { snapshotFold: FOLD_FN, log: logWithLaterAppend });

    runStory(projectEventDocSummary(streamRecord(undefined)), mocks);

    expect(foldCalls[0].input.events.map((e) => e.payload.metadata.eventId)).toEqual([eventId(0), eventId(1)]);
  });

  it('writes no snapshot when the collection registered no fold', () => {
    const { mocks, tables, foldCalls, updates } = buildMocks('doc-1');

    runStory(projectEventDocSummary(streamRecord(undefined)), mocks);

    // The summary projection is untouched by snapshots being off.
    expect(updates).toHaveLength(1);
    expect(foldCalls).toHaveLength(0);
    expect(tables[SNAPSHOTS_STORE]).toBeUndefined();
  });

  it('does not snapshot on a Remove, but still rebuilds the summary', () => {
    // A Remove is not a new event to snapshot at; the log shrank and the summary rebuild
    // reflects whatever it now says.
    const { mocks, tables, updates } = buildMocks('doc-1', 'template', { snapshotFold: FOLD_FN });

    runStory(projectEventDocSummary({ ...streamRecord(undefined), eventType: KvsStreamEventType.Remove }), mocks);

    expect(updates).toHaveLength(1);
    expect(tables[SNAPSHOTS_STORE]).toBeUndefined();
  });

  it('offloads a state over the inline cap to the blob drive, row recording only that', () => {
    const { mocks, tables, fileWrites } = buildMocks('doc-1', 'template', { snapshotFold: FOLD_FN });

    // A fold whose document state cannot fit a KVS row.
    mocks[InlineFunctionActionType.Execute] = () => ({ document: { huge: 'x'.repeat(301 * 1024) } });

    runStory(projectEventDocSummary(streamRecord(undefined)), mocks);

    expect(fileWrites).toHaveLength(1);
    expect(fileWrites[0].filepath).toBe(`doc-1/snapshots/document/${eventId(1)}`);
    expect(JSON.parse(fileWrites[0].data)).toEqual({ huge: 'x'.repeat(301 * 1024) });

    const rows = (tables[SNAPSHOTS_STORE] ?? []) as EventDocStoredSnapshot[];
    expect(rows).toHaveLength(1);
    // No path on the row: it is derived from the row's own keys, so the two cannot drift.
    expect(rows[0].data).toEqual({ type: 'storageDrive' });
  });

  it('carries the tenant scope through the prefix read and every snapshot write', () => {
    const { mocks, upserts, foldCalls } = buildMocks(`tenant-a${SCOPE_DELIMITER}doc-1`, 'template', { snapshotFold: FOLD_FN });

    runStory(projectEventDocSummary(streamRecord('tenant-a')), mocks);

    // The scoped prefix read found the log (it lives under the composed pk).
    expect(foldCalls[0].input.events).toHaveLength(2);

    const snapshotUpserts = upserts.filter((upsert) => upsert.keyValueStoreName === SNAPSHOTS_STORE);
    expect(snapshotUpserts).toHaveLength(2);
    expect(snapshotUpserts.every((upsert) => upsert.scope === 'tenant-a')).toBe(true);
  });
});
