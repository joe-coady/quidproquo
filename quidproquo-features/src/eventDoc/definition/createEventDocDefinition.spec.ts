import { ActionMockMap, askReduceState, AskResponse, DateActionType, Effect, GuidActionType, QpqReducer, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askApplyEventDocEvent } from '../actions';
import { buildEventDocFoldReducer, createEventDocInitialDocumentState } from '../fold';
import { EventDocDocument, EventDocEffect, EventDocEvent, EventDocEventPayload } from '../models';
import { createEventDocWorkspace } from '../workspace/createEventDocWorkspace';
import { EventDocWorkspaceSlotKind, EventDocWorkspaceState } from '../workspace/types';
import { createEventDocDefinition } from './createEventDocDefinition';
import { createEventDocStateReader } from './createEventDocStateReader';

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
      index,
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
