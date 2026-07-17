import {
  ActionMockMap,
  askMapParallel,
  askReduceState,
  AskResponse,
  askThrowError,
  DateActionType,
  Effect,
  ErrorTypeEnum,
  GuidActionType,
  QpqReducer,
  runStory,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askApplyEventDocEvent } from '../actions';
import { buildEventDocFoldReducer, createEventDocInitialDocumentState } from '../fold';
import { EventDocDocument, EventDocEffect, EventDocEvent, EventDocEventInput, EventDocEventPayload, EventDocStatus } from '../models';
import { EventDocEditorValidator } from '../validation';
import { askUIEventDocWorkspaceSetHistoryEvents } from './actionCreators';
import { createEventDocWorkspace } from './createEventDocWorkspace';
import {
  EventDocWorkspaceDocumentIdentity,
  EventDocWorkspaceDocumentSlotConfig,
  EventDocWorkspaceSlotKind,
  EventDocWorkspaceState,
  EventDocWorkspaceTransport,
} from './types';

// ─── A tiny "note" document domain, scope-blind like any real editor module ────────

enum NoteEvent {
  SetTitle = 'NOTE_SET_TITLE',
  AddLine = 'NOTE_ADD_LINE',
  SetLine = 'NOTE_SET_LINE',
}

type NoteLine = { lineId: string; text: string };
type NoteState = EventDocDocument & { title: string; lines: NoteLine[] };

const createInitialNoteState = (): NoteState => ({
  ...createEventDocInitialDocumentState(1),
  title: '',
  lines: [],
});

type NoteEffects =
  | Effect<NoteEvent.SetTitle, EventDocEventPayload<{ title: string }>>
  | Effect<NoteEvent.AddLine, EventDocEventPayload<NoteLine>>
  | Effect<NoteEvent.SetLine, EventDocEventPayload<NoteLine>>;

const setLine = (state: NoteState, payload: EventDocEventPayload<NoteLine>): NoteState => ({
  ...state,
  lines: state.lines.map((line) => (line.lineId === payload.data.lineId ? { ...line, text: payload.data.text } : line)),
});

const noteFoldReducer = buildEventDocFoldReducer<NoteState, NoteEffects>(createInitialNoteState, {
  [NoteEvent.SetTitle]: (state, payload) => ({ ...state, title: payload.data.title }),
  [NoteEvent.AddLine]: (state, payload) => ({ ...state, lines: [...state.lines, payload.data] }),
  [NoteEvent.SetLine]: setLine,
}) as QpqReducer<NoteState, EventDocEvent>;

function* askNoteSetTitle(title: string): AskResponse<void> {
  yield* askApplyEventDocEvent(NoteEvent.SetTitle, { title });
}

function* askNoteAddLine(lineId: string, text: string): AskResponse<void> {
  yield* askApplyEventDocEvent(NoteEvent.AddLine, { lineId, text });
}

function* askNoteSetLine(lineId: string, text: string): AskResponse<void> {
  yield* askApplyEventDocEvent(NoteEvent.SetLine, { lineId, text });
}

function* askNoteCreateDraft(): AskResponse<void> {
  yield* askApplyEventDocEvent(EventDocEffect.CreateDraft, {});
}

const noteApi = { askNoteSetTitle, askNoteAddLine, askNoteSetLine, askNoteCreateDraft };

const createNoteSlot = () =>
  ({
    kind: EventDocWorkspaceSlotKind.document,
    api: noteApi,
    foldReducer: noteFoldReducer,
    createInitialViewState: createInitialNoteState,
    schemaVersion: 1,
    coalesceEventTypes: [NoteEvent.SetTitle, { type: NoteEvent.SetLine, key: 'lineId' }],
  }) satisfies EventDocWorkspaceDocumentSlotConfig<NoteState, typeof noteApi>;

// ─── Test harness ───────────────────────────────────────────────────────────────────

// Deterministic guid/date providers; everything else a workspace yields is handled by
// askReduceState (state) or the bind (ApplyEvent), so nothing real reaches the runtime.
const createActionMocks = (): ActionMockMap => {
  let guidCount = 0;

  return {
    [GuidActionType.New]: () => `guid-${++guidCount}`,
    [DateActionType.Now]: '2026-07-16T00:00:00.000Z',
  };
};

type WorkspaceUnderTest = {
  createInitialState: () => EventDocWorkspaceState;
  reducer: QpqReducer<EventDocWorkspaceState, any>;
};

// The whole point: the workspace runs as pure story logic under askReduceState —
// no React runtime, no processors, no network.
const runWorkspaceStory = (workspace: WorkspaceUnderTest, story: () => AskResponse<void>): EventDocWorkspaceState =>
  runStory(askReduceState(workspace.createInitialState(), workspace.reducer, story), createActionMocks());

// Server-stamped events for seeding histories.
const serverEvent = (type: string, data: unknown, index: number): EventDocEvent => ({
  type,
  payload: {
    data,
    metadata: {
      version: 1,
      clientMessageId: `server-${index}`,
      createdBy: { userId: 'server', userDisplayName: 'Server' },
      createdAt: '2026-07-01T00:00:00.000Z',
      index,
    },
  },
});

const initStateEvent = (index = 0): EventDocEvent => serverEvent(EventDocEffect.InitState, { id: 'doc-1', code: 'DOC', name: 'Doc' }, index);
const publishEvent = (index: number): EventDocEvent => serverEvent(EventDocEffect.Publish, {}, index);

const identityA: EventDocWorkspaceDocumentIdentity = { serviceName: 'notes', basePath: '/notes', id: 'doc-1' };

type FakeTransport = {
  transport: EventDocWorkspaceTransport;
  appended: EventDocEventInput[];
  fetchCalls: { afterIndex?: number }[];
  setServerEvents: (events: EventDocEvent[]) => void;
  failAppendOnCall: (callNumber: number) => void;
  failFetches: () => void;
};

const createFakeTransport = (initialServerEvents: EventDocEvent[] = []): FakeTransport => {
  let serverEvents = [...initialServerEvents];
  let failAppendOn: number | null = null;
  let failFetch = false;
  let appendCalls = 0;
  const appended: EventDocEventInput[] = [];
  const fetchCalls: { afterIndex?: number }[] = [];

  function* askFetchEvents(_identity: EventDocWorkspaceDocumentIdentity, afterIndex?: number): AskResponse<EventDocEvent[]> {
    fetchCalls.push({ afterIndex });

    if (failFetch) {
      return yield* askThrowError(ErrorTypeEnum.GenericError, 'fetch boom');
    }

    return serverEvents.filter((event) => afterIndex === undefined || event.payload.metadata.index > afterIndex);
  }

  function* askAppendEvent(_identity: EventDocWorkspaceDocumentIdentity, input: EventDocEventInput): AskResponse<EventDocEvent> {
    appendCalls += 1;

    if (appendCalls === failAppendOn) {
      return yield* askThrowError(ErrorTypeEnum.GenericError, 'boom');
    }

    appended.push(input);

    const stored: EventDocEvent = {
      type: input.type,
      payload: {
        data: input.payload.data,
        metadata: {
          ...input.payload.metadata,
          createdBy: { userId: 'server', userDisplayName: 'Server' },
          createdAt: '2026-07-16T01:00:00.000Z',
          index: serverEvents.length,
        },
      },
    };

    serverEvents = [...serverEvents, stored];
    return stored;
  }

  return {
    transport: { askFetchEvents, askAppendEvent },
    appended,
    fetchCalls,
    setServerEvents: (events) => {
      serverEvents = [...events];
    },
    failAppendOnCall: (callNumber) => {
      failAppendOn = callNumber;
    },
    failFetches: () => {
      failFetch = true;
    },
  };
};

const createTestWorkspace = (transport?: EventDocWorkspaceTransport) =>
  createEventDocWorkspace({
    slots: {
      noteA: createNoteSlot(),
      noteB: createNoteSlot(),
    },
    transport,
  });

// ─── Scoped state: the core claim ────────────────────────────────────────────────────

describe('createEventDocWorkspace scoped state', () => {
  it('routes the SAME scope-blind api into separate slots via its binding', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteSetTitle('A title');
      yield* workspace.api.noteB.askNoteSetTitle('B title');
      yield* workspace.api.noteB.askNoteAddLine('l1', 'first line');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(1);
    expect(state.pending.noteA[0].payload.data).toEqual({ title: 'A title' });

    expect(state.pending.noteB).toHaveLength(2);
    expect(state.pending.noteB[0].payload.data).toEqual({ title: 'B title' });
    expect(state.pending.noteB[1].payload.data).toEqual({ lineId: 'l1', text: 'first line' });

    // Document commits buffer as pending; nothing lands in history without a save.
    expect(state.history.noteA).toHaveLength(0);
    expect(state.history.noteB).toHaveLength(0);
  });

  it('stamps provisional metadata from guid/date actions', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteSetTitle('A title');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA[0].payload.metadata).toEqual({
      version: 1,
      clientMessageId: 'guid-1',
      createdBy: { userId: '', userDisplayName: '' },
      createdAt: '2026-07-16T00:00:00.000Z',
      index: 0,
    });
  });

  it('routes nested bound calls to the INNER binding', () => {
    const workspaceRef: { current?: ReturnType<typeof createTestWorkspace> } = {};

    // A composed verb on noteA that also drives noteB through its bound api. The raw
    // verb routes to the enclosing (noteA) bind; the bound call re-binds inward.
    function* askOuter(): AskResponse<void> {
      yield* askNoteSetTitle('outer title');
      yield* workspaceRef.current!.api.noteB.askNoteSetTitle('inner title');
    }

    const workspace = createEventDocWorkspace({
      slots: {
        noteA: { ...createNoteSlot(), api: { ...noteApi, askOuter } },
        noteB: createNoteSlot(),
      },
    });
    workspaceRef.current = workspace as unknown as ReturnType<typeof createTestWorkspace>;

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askOuter();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(1);
    expect(state.pending.noteA[0].payload.data).toEqual({ title: 'outer title' });
    expect(state.pending.noteB).toHaveLength(1);
    expect(state.pending.noteB[0].payload.data).toEqual({ title: 'inner title' });
  });

  it('routes parallel commits (askRunParallel batches) without losing events', () => {
    const workspace = createTestWorkspace();
    const lineEntries: [string, string][] = [
      ['l1', 'one'],
      ['l2', 'two'],
    ];

    const addLineStoryForEntry = ([lineId, text]: [string, string]) => workspace.api.noteA.askNoteAddLine(lineId, text);

    function* story(): AskResponse<void> {
      yield* askMapParallel(lineEntries, addLineStoryForEntry);
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(2);
    expect(state.pending.noteA.map((event) => (event.payload.data as NoteLine).lineId).sort()).toEqual(['l1', 'l2']);
    expect(state.pending.noteA.map((event) => event.payload.metadata.index)).toEqual([0, 1]);
  });

  it('fails loudly when a document verb runs outside any workspace bind', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askNoteSetTitle('nowhere to go');
    }

    expect(() => runWorkspaceStory(workspace, story)).toThrow(/ApplyEvent/);
  });

  it("rejects a slot named 'workspace'", () => {
    expect(() => createEventDocWorkspace({ slots: { workspace: createNoteSlot() } })).toThrow(/reserved slot key/);
  });
});

// ─── Coalescing + renumbering ────────────────────────────────────────────────────────

describe('createEventDocWorkspace coalescing', () => {
  it('collapses a burst of a one-per-type event into the latest', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteSetTitle('one');
      yield* workspace.api.noteA.askNoteSetTitle('two');
      yield* workspace.api.noteA.askNoteSetTitle('three');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(1);
    expect(state.pending.noteA[0].payload.data).toEqual({ title: 'three' });
  });

  it('coalesces per item for { type, key } rules', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteSetLine('l1', 'first draft');
      yield* workspace.api.noteA.askNoteSetLine('l2', 'other line');
      yield* workspace.api.noteA.askNoteSetLine('l1', 'final');
    }

    const state = runWorkspaceStory(workspace, story);

    // l1's earlier edit is superseded; l2's is untouched.
    expect(state.pending.noteA).toHaveLength(2);
    expect(state.pending.noteA[0].payload.data).toEqual({ lineId: 'l2', text: 'other line' });
    expect(state.pending.noteA[1].payload.data).toEqual({ lineId: 'l1', text: 'final' });
  });

  it('renumbers pending indexes to continue the saved log', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent()]);
      yield* workspace.api.noteA.askNoteSetTitle('one');
      yield* workspace.api.noteA.askNoteAddLine('l1', 'line');
      yield* workspace.api.noteA.askNoteSetTitle('two'); // coalesces away 'one'
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA.map((event) => event.payload.metadata.index)).toEqual([1, 2]);
  });

  it('local slots default to last-write-wins per type, straight into history', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.chrome.askChromeSetHistoryOpen(true);
      yield* workspace.api.chrome.askChromeSetHistoryOpen(false);
      yield* workspace.api.chrome.askChromeSetHelpOpen(true);
    }

    const state = runWorkspaceStory(workspace, story);

    // No pending buffer for local slots, and one event per type in history.
    expect(state.pending.chrome).toHaveLength(0);
    expect(state.history.chrome).toHaveLength(2);
    expect(state.history.chrome.map((event) => event.payload.metadata.index)).toEqual([0, 1]);

    const chromeView = workspace.selectors.view.chrome(state);
    expect(chromeView.historyOpen).toBe(false);
    expect(chromeView.helpOpen).toBe(true);
  });
});

// ─── Validation ──────────────────────────────────────────────────────────────────────

describe('createEventDocWorkspace validation', () => {
  it('applies the default lifecycle guard: a published document rejects edits', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent(0), publishEvent(1)]);
      yield* workspace.api.noteA.askNoteSetTitle('should be rejected');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(0);
    expect(state.slots.noteA.error).not.toBeNull();
  });

  it('allows CREATE_DRAFT on a published document and clears the error', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent(0), publishEvent(1)]);
      yield* workspace.api.noteA.askNoteSetTitle('rejected'); // sets the error
      yield* workspace.api.noteA.askNoteCreateDraft();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(1);
    expect(state.pending.noteA[0].type).toBe(EventDocEffect.CreateDraft);
    expect(state.slots.noteA.error).toBeNull();
  });

  it('runs a configured domain validator instead of the default', () => {
    const rejectEmptyTitle: EventDocEditorValidator = (event) =>
      event.type === NoteEvent.SetTitle && !(event.payload.data as { title: string }).title ? 'Title required' : null;

    const workspace = createEventDocWorkspace({
      slots: {
        noteA: { ...createNoteSlot(), validate: rejectEmptyTitle },
      },
    });

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteSetTitle('');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(0);
    expect(state.slots.noteA.error).toBe('Title required');
  });
});

// ─── Built-in verbs: init / save / refresh / cancel ─────────────────────────────────

describe('createEventDocWorkspace built-in verbs', () => {
  it('init loads the saved log and seeds the document identity', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.history.noteA).toHaveLength(1);
    expect(state.slots.noteA.documentIdentity).toEqual(identityA);
    expect(state.slots.noteA.isLoading).toBe(false);
    expect(state.slots.noteA.error).toBeNull();

    // noteB was not initialised; untouched.
    expect(state.history.noteB).toHaveLength(0);
    expect(state.slots.noteB.documentIdentity).toBeNull();
  });

  it('init failure surfaces as slot error state', () => {
    const fake = createFakeTransport();
    fake.failFetches();
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.slots.noteA.error).toBe('Failed to load.');
    expect(state.slots.noteA.isLoading).toBe(false);
    expect(state.history.noteA).toHaveLength(0);
  });

  it('save streams pending into history one event at a time', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteAddLine('l1', 'one');
      yield* workspace.api.noteA.askNoteAddLine('l2', 'two');
      yield* workspace.api.workspace.askSave();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(fake.appended).toHaveLength(2);
    // Only the client-owned fields go over the wire.
    expect(fake.appended[0].payload.metadata).toEqual({ version: 1, clientMessageId: 'guid-1' });

    expect(state.pending.noteA).toHaveLength(0);
    expect(state.history.noteA).toHaveLength(3);
    // Server-stamped metadata replaces the provisional buffer metadata.
    expect(state.history.noteA[1].payload.metadata.createdBy.userId).toBe('server');
    expect(state.history.noteA[1].payload.metadata.index).toBe(1);
    expect(state.slots.noteA.isSaving).toBe(false);
  });

  it('an interrupted save leaves exactly the unsaved tail pending', () => {
    const fake = createFakeTransport([initStateEvent()]);
    fake.failAppendOnCall(2);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteAddLine('l1', 'one');
      yield* workspace.api.noteA.askNoteAddLine('l2', 'two');
      yield* workspace.api.workspace.askSave();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.history.noteA).toHaveLength(2); // init + first line
    expect(state.pending.noteA).toHaveLength(1);
    expect(state.pending.noteA[0].payload.data).toEqual({ lineId: 'l2', text: 'two' });
    expect(state.slots.noteA.error).toBe('Failed to save - boom');
    expect(state.slots.noteA.isSaving).toBe(false);
  });

  it('refresh tail-pulls only the events after the last held index', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    // The server log grows between init and refresh (another editor appended), so the
    // refresh must fetch from afterIndex 0 and append only the tail.
    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      fake.setServerEvents([initStateEvent(), serverEvent(NoteEvent.SetTitle, { title: 'from elsewhere' }, 1)]);
      yield* workspace.api.workspace.askRefresh('noteA');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(fake.fetchCalls).toEqual([{ afterIndex: undefined }, { afterIndex: 0 }]);
    expect(state.history.noteA).toHaveLength(2);
    expect(state.history.noteA[1].payload.data).toEqual({ title: 'from elsewhere' });
  });

  it('cancel discards pending and leaves history untouched', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteSetTitle('discard me');
      yield* workspace.api.workspace.askCancel();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(0);
    expect(state.history.noteA).toHaveLength(1);
    expect(state.slots.noteA.error).toBeNull();
  });

  it('transport verbs fail loudly on a transportless workspace', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askSave();
    }

    expect(() => runWorkspaceStory(workspace, story)).toThrow(/transport/);
  });
});

// ─── Selectors ───────────────────────────────────────────────────────────────────────

describe('createEventDocWorkspace selectors', () => {
  it('folds the live view from saved + pending and memoizes on stream identity', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent()]);
      yield* workspace.api.noteA.askNoteSetTitle('Live title');
      yield* workspace.api.noteA.askNoteAddLine('l1', 'a line');
    }

    const state = runWorkspaceStory(workspace, story);

    const view = workspace.selectors.view.noteA(state);
    expect(view.id).toBe('doc-1'); // from the saved INIT_STATE
    expect(view.title).toBe('Live title'); // from pending
    expect(view.lines).toEqual([{ lineId: 'l1', text: 'a line' }]);
    expect(view.status).toBe(EventDocStatus.Draft);

    // Same streams = the exact same folded object, not a refold.
    expect(workspace.selectors.view.noteA(state)).toBe(view);

    expect(workspace.selectors.liveEvents.noteA(state)).toHaveLength(3);
    expect(workspace.selectors.isDirty(state)).toBe(true);
    expect(workspace.selectors.view.noteB(state).id).toBe(''); // untouched slot folds to its initial
  });

  it('isDirty goes false once pending is drained by a save', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteSetTitle('to save');
      yield* workspace.api.workspace.askSave();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(workspace.selectors.isDirty(state)).toBe(false);
    expect(workspace.selectors.view.noteA(state).title).toBe('to save');
    expect(workspace.selectors.error(state)).toBeNull();
  });
});
