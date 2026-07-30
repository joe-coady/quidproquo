import { ActionMockMap, askReduceState, AskResponse, DateActionType, Effect, GuidActionType, QpqReducer, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askApplyEventDocEvent } from '../actions';
import { buildEventDocFoldReducer, createEventDocInitialDocumentState } from '../fold';
import { EventDocDocument, EventDocEffect, EventDocEvent, EventDocEventPayload } from '../models';
import { createEventDocWorkspace } from '../workspace/createEventDocWorkspace';
import { EventDocWorkspaceSlotKind, EventDocWorkspaceState } from '../workspace/types';
import { createEventDocDefinition } from './createEventDocDefinition';
import { createEventDocStateReader } from './createEventDocStateReader';

// Sortable event ids are opaque strings ordered lexicographically; padded counters stand in.
const eventId = (n: number): string => String(n).padStart(4, '0');

let sortableGuidCount = 0;

// ─── A tiny "memo" doc domain ───────────────────────────────────────────────────────

enum MemoEvent {
  SetBody = 'MEMO_SET_BODY',
}

type MemoState = EventDocDocument & { body: string };

const createInitialMemoState = (): MemoState => ({
  ...createEventDocInitialDocumentState(1),
  body: '',
});

type MemoEffects = Effect<MemoEvent.SetBody, EventDocEventPayload<{ body: string }>>;

const memoFoldReducer = buildEventDocFoldReducer<MemoState, MemoEffects>(createInitialMemoState, {
  [MemoEvent.SetBody]: (state, payload) => ({ ...state, body: payload.data.body }),
}) as QpqReducer<MemoState, EventDocEvent>;

const askReadMemo = createEventDocStateReader<MemoState>();

function* askMemoSetBody(body: string): AskResponse<void> {
  yield* askApplyEventDocEvent(MemoEvent.SetBody, { body });
}

// Read-to-derive-a-write through the doc's own reader.
function* askMemoAppendLine(line: string): AskResponse<void> {
  const memo = yield* askReadMemo();
  yield* askApplyEventDocEvent(MemoEvent.SetBody, { body: memo.body ? `${memo.body}\n${line}` : line });
}

const memoApi = { askMemoSetBody, askMemoAppendLine };

const createMemoDefinition = () =>
  createEventDocDefinition({
    schemaVersion: 1,
    foldReducer: memoFoldReducer,
    createInitialViewState: createInitialMemoState,
    api: memoApi,
  });

// ─── Harness (same pattern as the workspace spec) ───────────────────────────────────

const actionMocks: ActionMockMap = {
  [GuidActionType.New]: () => 'guid-1',
  // Sortable ids must sort lexicographically in creation order; pad so they do.
  [GuidActionType.NewSortable]: () => `sguid-${String(++sortableGuidCount).padStart(4, '0')}`,
  [DateActionType.Now]: () => '2026-07-21T00:00:00.000Z',
};

type WorkspaceUnderTest = {
  createInitialState: () => EventDocWorkspaceState;
  reducer: QpqReducer<EventDocWorkspaceState, any>;
};

const runWorkspaceStory = (workspace: WorkspaceUnderTest, story: () => AskResponse<void>): EventDocWorkspaceState =>
  runStory(askReduceState(workspace.createInitialState(), workspace.reducer, story), actionMocks);

const serverEvent = (type: string, data: unknown, index: number, version = 1): EventDocEvent => ({
  type,
  payload: {
    data,
    metadata: {
      version,
      clientMessageId: `server-${index}`,
      createdBy: { userId: 'server', userDisplayName: 'Server' },
      createdAt: '2026-07-01T00:00:00.000Z',
      eventId: eventId(index),
    },
  },
});

// ─── Specs ──────────────────────────────────────────────────────────────────────────

describe('createEventDocDefinition', () => {
  it('is a document slot config, mountable verbatim in a workspace', () => {
    const memoDefinition = createMemoDefinition();
    const workspace = createEventDocWorkspace({ slots: { memo: memoDefinition } });

    function* story(): AskResponse<void> {
      yield* workspace.docs.memo.api.askMemoSetBody('hello');
      yield* workspace.docs.memo.api.askMemoAppendLine('world');
    }

    const state = runWorkspaceStory(workspace, story);

    // The one-per-type coalesce default doesn't apply to a saved doc's domain events,
    // so both commits buffer; the second READ the first through the bind.
    expect(state.pending.memo).toHaveLength(2);
    expect(state.pending.memo[1].payload.data).toEqual({ body: 'hello\nworld' });
  });

  it('merges the generic identity/lifecycle verbs into the api, bound like any other', () => {
    const memoDefinition = createMemoDefinition();
    const workspace = createEventDocWorkspace({ slots: { memo: memoDefinition } });

    function* story(): AskResponse<void> {
      yield* workspace.docs.memo.api.askEventDocSetCode('MEMO-1');
      yield* workspace.docs.memo.api.askEventDocSetName('My memo');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.memo.map((event) => event.type)).toEqual([EventDocEffect.SetCode, EventDocEffect.SetName]);
  });

  it('throws when a domain api redefines a built-in verb', () => {
    expect(() =>
      createEventDocDefinition({
        schemaVersion: 1,
        foldReducer: memoFoldReducer,
        createInitialViewState: createInitialMemoState,
        api: { ...memoApi, askEventDocSetCode: askMemoSetBody },
      }),
    ).toThrow(/askEventDocSetCode/);
  });

  it('fold is the canonical log fold: seeds, folds, and climbs to the latest version', () => {
    type MemoV2State = MemoState & { pinned: boolean };

    const memoV2Definition = createEventDocDefinition({
      schemaVersion: 2,
      foldReducer: memoFoldReducer as unknown as QpqReducer<MemoV2State, EventDocEvent>,
      createInitialViewState: (): MemoV2State => ({ ...createInitialMemoState(), schemaVersion: 2, pinned: false }),
      migrations: { 2: (state) => ({ ...state, pinned: false }) as MemoV2State },
      api: memoApi,
    });

    const folded = memoV2Definition.fold([
      serverEvent(EventDocEffect.InitState, { id: 'memo-1', code: 'MEMO', name: 'Memo' }, 0),
      serverEvent(MemoEvent.SetBody, { body: 'from the log' }, 1),
    ]);

    // The v1-authored log folds and the read-side migration carries it to v2.
    expect(folded.body).toBe('from the log');
    expect(folded.schemaVersion).toBe(2);
    expect(folded.pinned).toBe(false);
  });

  it('saved: false creates an unsaved doc — a local slot config, no fold, no generic verbs', () => {
    const experienceDefinition = createEventDocDefinition({
      saved: false,
      foldReducer: ((state: { activeTab: string }) => [state, false]) as unknown as QpqReducer<{ activeTab: string }, EventDocEvent>,
      createInitialViewState: () => ({ activeTab: 'details' }),
      api: {},
    });

    expect(experienceDefinition.kind).toBe(EventDocWorkspaceSlotKind.local);
    expect('fold' in experienceDefinition).toBe(false);
    expect('askEventDocSetCode' in experienceDefinition.api).toBe(false);
  });
});

describe('createEventDocDefinition validators', () => {
  // Appends no longer validate, so a rule that does not reach the FOLD is a rule nothing
  // applies. These pin that the definition carries them all the way there.
  const noEmptyBody = {
    [MemoEvent.SetBody]: (event: EventDocEvent) => ((event.payload.data as { body: string }).body ? null : 'A memo body cannot be empty'),
  };

  const withValidators = () =>
    createEventDocDefinition({
      schemaVersion: 1,
      foldReducer: memoFoldReducer,
      createInitialViewState: createInitialMemoState,
      api: memoApi,
      validators: noEmptyBody,
    });

  const setBody = (body: string, index: number): EventDocEvent => ({
    type: MemoEvent.SetBody,
    payload: {
      data: { body },
      metadata: {
        version: 1,
        clientMessageId: `msg-${index}`,
        createdBy: { userId: 'u', userDisplayName: 'U' },
        createdAt: `2026-07-30T00:00:0${index}.000Z` as EventDocEvent['payload']['metadata']['createdAt'],
        eventId: String(index).padStart(4, '0'),
      },
    },
  });

  it('folds an event its rules accept', () => {
    expect(withValidators().fold([setBody('hello', 0)]).body).toBe('hello');
  });

  it('IGNORES an event its rules reject, rather than folding it in', () => {
    // The event is in the log — nothing stopped it being written — so the fold is the only
    // thing standing between a bad event and the document.
    const state = withValidators().fold([setBody('hello', 0), setBody('', 1)]);

    expect(state.body).toBe('hello');
  });

  it('applies the reserved guard to event types the collection says nothing about', () => {
    // A collection declares only its own rules; everything else still falls to the reserved
    // wildcard, so supplying `validators` cannot accidentally unguard the whole doc.
    const published: EventDocEvent = {
      ...setBody('x', 1),
      type: EventDocEffect.Publish,
      payload: { ...setBody('x', 1).payload, data: { effectiveFrom: '2026-07-30T00:00:00.000Z' } },
    };

    const setName: EventDocEvent = {
      ...setBody('x', 2),
      type: EventDocEffect.SetName,
      payload: { ...setBody('x', 2).payload, data: { name: 'renamed' } },
    };

    const state = withValidators().fold([setBody('before', 0), published, setName]);

    // SET_NAME has no domain rule, so requireDraft applies and the rename after publish is
    // dropped — the document keeps the name it had.
    expect(state.name).not.toBe('renamed');
  });

  it('lets a domain rule REPLACE the reserved guard for its own event type', () => {
    // Sharp edge, and deliberate: validateEventDocEvent resolves `validators[type] ?? '*'`, so
    // naming a type takes full responsibility for it — the lifecycle guard no longer applies.
    // client-access depends on exactly this to allow secret rotation on a PUBLISHED client. The
    // cost is that a collection wanting the guard as well has to compose it in itself.
    const published: EventDocEvent = {
      ...setBody('x', 1),
      type: EventDocEffect.Publish,
      payload: { ...setBody('x', 1).payload, data: { effectiveFrom: '2026-07-30T00:00:00.000Z' } },
    };

    const state = withValidators().fold([setBody('before', 0), published, setBody('after', 2)]);

    expect(state.body).toBe('after');
  });

  it('derives the editor pre-flight from the same rules', () => {
    // Two sources of truth here would let a client consider legal something the fold drops.
    expect(withValidators().validate?.(setBody('', 0), [])).toMatch(/cannot be empty/);
    expect(withValidators().validate?.(setBody('ok', 0), [])).toBeNull();
  });

  it('applies the reserved guard even when a doc declares NO rules of its own', () => {
    // The regression that prompted this: making the guard conditional on `validators` meant
    // every doc without domain rules folded edits made after publish. Only one doc in DocGen
    // had domain rules, so in practice the lifecycle guard was running almost nowhere.
    const published: EventDocEvent = {
      ...setBody('x', 1),
      type: EventDocEffect.Publish,
      payload: { ...setBody('x', 1).payload, data: { effectiveFrom: '2026-07-30T00:00:00.000Z' } },
    };

    const state = createMemoDefinition().fold([setBody('before', 0), published, setBody('after', 2)]);

    expect(state.body).toBe('before');
  });

  it('gives a doc with no rules an editor pre-flight too, so the edit is refused not ignored', () => {
    // Without this the editor accepts the edit, the fold drops it, and the UI just does
    // nothing — the worst of the three outcomes.
    const published: EventDocEvent = {
      ...setBody('x', 1),
      type: EventDocEffect.Publish,
      payload: { ...setBody('x', 1).payload, data: { effectiveFrom: '2026-07-30T00:00:00.000Z' } },
    };

    const reason = createMemoDefinition().validate?.(setBody('after', 2), [setBody('before', 0), published]);

    expect(reason).toMatch(/draft/i);
  });
});
