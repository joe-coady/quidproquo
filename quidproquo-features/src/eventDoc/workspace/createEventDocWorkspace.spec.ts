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

import { askApplyEventDocEvent, askApplyTransientEventDocEvent } from '../actions';
import { buildEventDocFoldReducer, buildVersionRoutedReducer, createEventDocInitialDocumentState, foldEventDocLogStep } from '../fold';
import { EventDocDocument, EventDocEffect, EventDocEvent, EventDocEventInput, EventDocEventPayload, EventDocStatus } from '../models';
import { EventDocEditorValidator } from '../validation';
import { getSlotLiveEvents } from './logic/getSlotLiveEvents';
import { getSlotTransientEvents } from './logic/getSlotTransientEvents';
import {
  askUIEventDocWorkspaceAppendHistoryEvent,
  askUIEventDocWorkspaceApplyTransientEvent,
  askUIEventDocWorkspaceDropTransient,
  askUIEventDocWorkspaceReset,
  askUIEventDocWorkspaceSetHistoryEvents,
  askUIEventDocWorkspaceSetPendingEvents,
} from './actionCreators';
import { createEventDocWorkspace } from './createEventDocWorkspace';
import {
  EventDocWorkspaceDocumentIdentity,
  EventDocWorkspaceDocumentSlotConfig,
  EventDocWorkspaceSlotKind,
  EventDocWorkspaceSlotOperation,
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

// Transient siblings: same domain events, but committed into a never-saved group
// keyed by transientKey (a stand-in for a websocket connection id).
function* askNoteTransientSetTitle(transientKey: string, title: string): AskResponse<void> {
  yield* askApplyTransientEventDocEvent(transientKey, NoteEvent.SetTitle, { title });
}

function* askNoteTransientAddLine(transientKey: string, lineId: string, text: string): AskResponse<void> {
  yield* askApplyTransientEventDocEvent(transientKey, NoteEvent.AddLine, { lineId, text });
}

const noteApi = { askNoteSetTitle, askNoteAddLine, askNoteSetLine, askNoteCreateDraft, askNoteTransientSetTitle, askNoteTransientAddLine };

const createNoteSlot = () =>
  ({
    kind: EventDocWorkspaceSlotKind.document,
    api: noteApi,
    foldReducer: noteFoldReducer,
    createInitialViewState: createInitialNoteState,
    schemaVersion: 1,
    coalesceEventTypes: [NoteEvent.SetTitle, { type: NoteEvent.SetLine, key: 'lineId' }],
  }) satisfies EventDocWorkspaceDocumentSlotConfig<NoteState, typeof noteApi>;

// ─── v2 of the note domain: the document gains `archived` via the v2 migration ──────
// Only what the accumulator-semantics spec needs; the log under test is all v1, so the
// version-routed reducer carries just the v1 handlers.

type NoteV2State = NoteState & { archived: boolean };

const createInitialNoteV2State = (): NoteV2State => ({
  ...createInitialNoteState(),
  schemaVersion: 2,
  archived: false,
});

const noteV2Migration = (state: EventDocDocument): EventDocDocument => ({ ...state, archived: false }) as NoteV2State;

const createNoteV2Slot = () =>
  ({
    kind: EventDocWorkspaceSlotKind.document,
    api: noteApi,
    // Deliberately wider than the slot's TView: mid-fold the accumulator really is a
    // v1 NoteState (no `archived`) until the read-side migrate, hence the unknown hop.
    foldReducer: buildVersionRoutedReducer<NoteState>({ 1: noteFoldReducer }) as unknown as QpqReducer<NoteV2State, EventDocEvent>,
    createInitialViewState: createInitialNoteV2State,
    schemaVersion: 2,
    migrations: { 2: noteV2Migration },
  }) satisfies EventDocWorkspaceDocumentSlotConfig<NoteV2State, typeof noteApi>;

// ─── Test harness ───────────────────────────────────────────────────────────────────

const constantNow = '2026-07-16T00:00:00.000Z';

// Deterministic guid/date providers; everything else a workspace yields is handled by
// askReduceState (state) or the bind (ApplyEvent), so nothing real reaches the runtime.
// `dates` are served in commit order then fall back to the constant — the transient
// specs need crafted, distinct createdAt values (transient ordering is by time), while
// every other spec keeps its stable constant timestamp.
const createActionMocks = (dates: string[] = []): ActionMockMap => {
  let guidCount = 0;
  let dateCount = 0;

  return {
    [GuidActionType.New]: () => `guid-${++guidCount}`,
    [DateActionType.Now]: () => dates[dateCount++] ?? constantNow,
  };
};

type WorkspaceUnderTest = {
  createInitialState: () => EventDocWorkspaceState;
  reducer: QpqReducer<EventDocWorkspaceState, any>;
};

// The whole point: the workspace runs as pure story logic under askReduceState —
// no React runtime, no processors, no network.
const runWorkspaceStory = (workspace: WorkspaceUnderTest, story: () => AskResponse<void>, dates?: string[]): EventDocWorkspaceState =>
  runStory(askReduceState(workspace.createInitialState(), workspace.reducer, story), createActionMocks(dates));

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

const eventAtVersion = (event: EventDocEvent, version: number): EventDocEvent => ({
  ...event,
  payload: { ...event.payload, metadata: { ...event.payload.metadata, version } },
});

// The reference full refold the incremental historyViews maintenance must match: the
// raw ACCUMULATOR (seed + per-event steps), never final-migrated — that is the read
// side's job. Not foldEventDocLog, which climbs to the latest version at the end.
const foldNoteHistory = (events: EventDocEvent[]): NoteState => {
  let state: EventDocDocument = createInitialNoteState();

  for (const event of events) {
    state = foldEventDocLogStep(state, event, { reducer: noteFoldReducer, migrations: {}, latestVersion: 1 });
  }

  return state as NoteState;
};

const identityA: EventDocWorkspaceDocumentIdentity = { serviceName: 'notes', basePath: '/notes', id: 'doc-1' };

type FakeTransport = {
  transport: EventDocWorkspaceTransport;
  appended: EventDocEventInput[];
  fetchCalls: { afterIndex?: number }[];
  setServerEvents: (events: EventDocEvent[]) => void;
  failAppendOnCall: (callNumber: number, errorType?: ErrorTypeEnum) => void;
  failFetches: () => void;
};

const createFakeTransport = (initialServerEvents: EventDocEvent[] = []): FakeTransport => {
  let serverEvents = [...initialServerEvents];
  let failAppendOn: number | null = null;
  let failAppendErrorType = ErrorTypeEnum.GenericError;
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
      return yield* askThrowError(failAppendErrorType, 'boom');
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
    failAppendOnCall: (callNumber, errorType = ErrorTypeEnum.GenericError) => {
      failAppendOn = callNumber;
      failAppendErrorType = errorType;
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

  it('local slots default to last-write-wins per type, buffered in pending', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.chrome.askChromeSetHistoryOpen(true);
      yield* workspace.api.chrome.askChromeSetHistoryOpen(false);
      yield* workspace.api.chrome.askChromeSetHelpOpen(true);
    }

    const state = runWorkspaceStory(workspace, story);

    // Local commits buffer in pending like everything else (they just never save), so
    // history stays strictly server truth: empty. One pending event per type.
    expect(state.history.chrome).toHaveLength(0);
    expect(state.pending.chrome).toHaveLength(2);
    expect(state.pending.chrome.map((event) => event.payload.metadata.index)).toEqual([0, 1]);

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
    expect(state.slots.noteA.error?.operation).toBe(EventDocWorkspaceSlotOperation.validation);
    expect(state.slots.noteA.error?.error.errorType).toBe(ErrorTypeEnum.Invalid);
  });

  it('allows CREATE_DRAFT on a published document and clears the error', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent(0), publishEvent(1)]);
      yield* workspace.api.noteA.askNoteSetTitle('rejected'); // sets the validation error
      yield* workspace.api.noteA.askNoteCreateDraft();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.pending.noteA).toHaveLength(1);
    expect(state.pending.noteA[0].type).toBe(EventDocEffect.CreateDraft);
    // The successful commit wipes the earlier rejection via the ClearError effect.
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
    expect(state.slots.noteA.error).toEqual({
      operation: EventDocWorkspaceSlotOperation.validation,
      error: { errorType: ErrorTypeEnum.Invalid, errorText: 'Title required' },
    });
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

    // The caught transport error passes through untouched: typed, not flattened.
    expect(state.slots.noteA.error?.operation).toBe(EventDocWorkspaceSlotOperation.load);
    expect(state.slots.noteA.error?.error.errorType).toBe(ErrorTypeEnum.GenericError);
    expect(state.slots.noteA.error?.error.errorText).toBe('fetch boom');
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
    expect(state.slots.noteA.error?.operation).toBe(EventDocWorkspaceSlotOperation.save);
    expect(state.slots.noteA.error?.error.errorType).toBe(ErrorTypeEnum.GenericError);
    expect(state.slots.noteA.error?.error.errorText).toBe('boom');
    expect(state.slots.noteA.isSaving).toBe(false);
  });

  it('a save failure preserves the transport error type', () => {
    const fake = createFakeTransport([initStateEvent()]);
    fake.failAppendOnCall(1, ErrorTypeEnum.NotFound);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteAddLine('l1', 'one');
      yield* workspace.api.workspace.askSave();
    }

    const state = runWorkspaceStory(workspace, story);

    // The original errorType survives the channel; consumers can branch on it.
    expect(state.slots.noteA.error?.operation).toBe(EventDocWorkspaceSlotOperation.save);
    expect(state.slots.noteA.error?.error.errorType).toBe(ErrorTypeEnum.NotFound);
    expect(state.pending.noteA).toHaveLength(1);
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

  it('cancel clears document slots only; chrome pending survives', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteSetTitle('discard me');
      yield* workspace.api.chrome.askChromeSetHelpOpen(true);
      yield* workspace.api.workspace.askCancel();
    }

    const state = runWorkspaceStory(workspace, story);

    // Local pending (tabs, panels) is session state, not an unsaved edit; Cancel
    // only discards document drafts.
    expect(state.pending.noteA).toHaveLength(0);
    expect(state.pending.chrome).toHaveLength(1);
    expect(workspace.selectors.view.chrome(state).helpOpen).toBe(true);
  });

  it('transport verbs fail loudly on a transportless workspace', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askSave();
    }

    expect(() => runWorkspaceStory(workspace, story)).toThrow(/transport/);
  });
});

// ─── historyViews: the stored fold ───────────────────────────────────────────────────

describe('createEventDocWorkspace historyViews', () => {
  it('seeds each slot with its initial view state', () => {
    const workspace = createTestWorkspace();
    const state = workspace.createInitialState();

    expect(state.historyViews.noteA).toEqual(createInitialNoteState());
    expect(state.historyViews.noteB).toEqual(createInitialNoteState());
    expect(state.historyViews.chrome).toEqual({ historyOpen: false, helpOpen: false, historySlotKey: null });
  });

  it('init full-folds the loaded log into the stored view', () => {
    const fake = createFakeTransport([initStateEvent(0), serverEvent(NoteEvent.SetTitle, { title: 'Loaded' }, 1)]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.historyViews.noteA).toEqual(foldNoteHistory(state.history.noteA));
    expect((state.historyViews.noteA as NoteState).title).toBe('Loaded');
  });

  it('save landings fold incrementally and match a full refold of the final history', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteAddLine('l1', 'one');
      yield* workspace.api.noteA.askNoteAddLine('l2', 'two');
      yield* workspace.api.workspace.askSave();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.history.noteA).toHaveLength(3);
    expect(state.historyViews.noteA).toEqual(foldNoteHistory(state.history.noteA));
    expect((state.historyViews.noteA as NoteState).lines).toEqual([
      { lineId: 'l1', text: 'one' },
      { lineId: 'l2', text: 'two' },
    ]);
  });

  it('refresh folds only the fetched tail into the stored view', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      fake.setServerEvents([initStateEvent(), serverEvent(NoteEvent.SetTitle, { title: 'from elsewhere' }, 1)]);
      yield* workspace.api.workspace.askRefresh('noteA');
    }

    const state = runWorkspaceStory(workspace, story);

    // The tail-pull appended (not re-set) the log, and the incremental fold matches
    // the reference full refold.
    expect(fake.fetchCalls).toEqual([{ afterIndex: undefined }, { afterIndex: 0 }]);
    expect((state.historyViews.noteA as NoteState).title).toBe('from elsewhere');
    expect(state.historyViews.noteA).toEqual(foldNoteHistory(state.history.noteA));
  });

  it('an all-old-version log stores the raw accumulator; refresh tails at that version fold fine; the view reads latest', () => {
    // The regression this revision fixes: the whole saved log is authored at v1
    // inside a slot whose latest is v2. Storing a latest-migrated view used to
    // force the doc to v2 at init, and the (perfectly valid) v1 refresh tail then
    // tripped the below-version guard. The accumulator folds it naturally.
    const workspace = createEventDocWorkspace({ slots: { noteA: createNoteV2Slot() } });

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent(0), serverEvent(NoteEvent.SetTitle, { title: 'Old doc' }, 1)]);
      yield* askUIEventDocWorkspaceAppendHistoryEvent('noteA', serverEvent(NoteEvent.AddLine, { lineId: 'l1', text: 'still v1' }, 2));
    }

    const state = runWorkspaceStory(workspace, story);

    // The stored view is the raw accumulator: still at the log's authored version,
    // unmigrated (no `archived` yet).
    const accumulator = state.historyViews.noteA as NoteV2State;
    expect(accumulator.schemaVersion).toBe(1);
    expect(accumulator.title).toBe('Old doc');
    expect(accumulator.lines).toEqual([{ lineId: 'l1', text: 'still v1' }]);
    expect('archived' in accumulator).toBe(false);

    // The read side migrates: latest-shaped even with nothing pending.
    const view = workspace.selectors.view.noteA(state);
    expect(view.schemaVersion).toBe(2);
    expect(view.archived).toBe(false);
    expect(view.title).toBe('Old doc');
  });

  it('reset reseeds the initial history views', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent(0), serverEvent(NoteEvent.SetTitle, { title: 'gone' }, 1)]);
      yield* askUIEventDocWorkspaceReset();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.history.noteA).toHaveLength(0);
    expect(state.historyViews.noteA).toEqual(createInitialNoteState());
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

  it('view is the stored history view plus the pending fold', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent()]);
      yield* workspace.api.noteA.askNoteSetTitle('unsaved title');
    }

    const state = runWorkspaceStory(workspace, story);

    // The stored base holds only saved truth; the live view layers pending on top.
    expect((state.historyViews.noteA as NoteState).title).toBe('');
    expect(workspace.selectors.view.noteA(state).title).toBe('unsaved title');
    expect(workspace.selectors.view.noteA(state).id).toBe('doc-1');
  });

  it('isDirty counts document pending only: a chrome toggle does not dirty', () => {
    const workspace = createTestWorkspace();

    function* chromeOnlyStory(): AskResponse<void> {
      yield* workspace.api.chrome.askChromeSetHelpOpen(true);
    }

    const chromeOnlyState = runWorkspaceStory(workspace, chromeOnlyStory);
    expect(chromeOnlyState.pending.chrome).toHaveLength(1);
    expect(workspace.selectors.isDirty(chromeOnlyState)).toBe(false);

    function* documentEditStory(): AskResponse<void> {
      yield* workspace.api.chrome.askChromeSetHelpOpen(true);
      yield* workspace.api.noteA.askNoteSetTitle('unsaved');
    }

    const documentEditState = runWorkspaceStory(workspace, documentEditStory);
    expect(workspace.selectors.isDirty(documentEditState)).toBe(true);
  });

  it('a pending event at a mismatched schema version throws at view read', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetPendingEvents('noteA', [eventAtVersion(serverEvent(NoteEvent.SetTitle, { title: 'v2' }, 0), 2)]);
    }

    const state = runWorkspaceStory(workspace, story);

    expect(() => workspace.selectors.view.noteA(state)).toThrow(/pending event/);
  });
});

// ─── Transient streams: events that were never meant to survive ─────────────────────

describe('createEventDocWorkspace transient streams', () => {
  it('routes transient applies via the bind into the right slot AND key, stamped, unvalidated', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'a1');
      yield* workspace.api.noteA.askNoteTransientAddLine('conn-2', 'l1', 'from conn-2');
      yield* workspace.api.noteB.askNoteTransientSetTitle('conn-1', 'b1');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(Object.keys(state.transient.noteA).sort()).toEqual(['conn-1', 'conn-2']);
    expect(state.transient.noteA['conn-1']).toHaveLength(1);
    expect(state.transient.noteA['conn-1'][0].payload.data).toEqual({ title: 'a1' });
    expect(state.transient.noteA['conn-2'][0].payload.data).toEqual({ lineId: 'l1', text: 'from conn-2' });
    expect(state.transient.noteB['conn-1'][0].payload.data).toEqual({ title: 'b1' });

    // Same guid/date/schemaVersion stamping as the ordinary commit; index stays 0
    // (never renumbered — transient ordering is by createdAt at read).
    expect(state.transient.noteA['conn-1'][0].payload.metadata).toEqual({
      version: 1,
      clientMessageId: 'guid-1',
      createdBy: { userId: '', userDisplayName: '' },
      createdAt: constantNow,
      index: 0,
    });

    // Nothing leaks into the persistable groups.
    expect(state.pending.noteA).toHaveLength(0);
    expect(state.pending.noteB).toHaveLength(0);
    expect(state.history.noteA).toHaveLength(0);
  });

  it('skips validation: a published document still accepts transient events', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent(0), publishEvent(1)]);
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'observation, not an edit');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.transient.noteA['conn-1']).toHaveLength(1);
    expect(state.slots.noteA.error).toBeNull();
  });

  it('folds base + pending + transient, transient ordered by createdAt across keys', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent()]);
      yield* workspace.api.noteA.askNoteAddLine('l1', 'pending line');
      yield* workspace.api.noteA.askNoteTransientAddLine('conn-b', 'l2', 'late');
      yield* workspace.api.noteA.askNoteTransientAddLine('conn-a', 'l3', 'early');
    }

    const state = runWorkspaceStory(workspace, story, [
      '2026-07-16T00:00:00.000Z', // the pending commit
      '2026-07-16T00:00:03.000Z', // conn-b's transient: committed FIRST, stamped LATER
      '2026-07-16T00:00:01.000Z', // conn-a's transient: committed second, stamped earlier
    ]);

    // The merge is time-ordered, not commit-ordered.
    const transientLineIds = getSlotTransientEvents(state, 'noteA').map((event) => (event.payload.data as NoteLine).lineId);
    expect(transientLineIds).toEqual(['l3', 'l2']);

    // Block order in the fold: pending before every transient; then time within transient.
    const view = workspace.selectors.view.noteA(state);
    expect(view.lines).toEqual([
      { lineId: 'l1', text: 'pending line' },
      { lineId: 'l3', text: 'early' },
      { lineId: 'l2', text: 'late' },
    ]);
  });

  it('breaks createdAt ties by transientKey then position for determinism', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteTransientAddLine('zz', 'l1', 'zz first');
      yield* workspace.api.noteA.askNoteTransientAddLine('aa', 'l2', 'aa first');
      yield* workspace.api.noteA.askNoteTransientAddLine('zz', 'l3', 'zz second');
    }

    // The constant date mock stamps every event identically, so ONLY the tie-break
    // orders the merge: 'aa' before 'zz', positions within a key preserved.
    const state = runWorkspaceStory(workspace, story);

    expect(getSlotTransientEvents(state, 'noteA').map((event) => (event.payload.data as NoteLine).lineId)).toEqual(['l2', 'l1', 'l3']);
  });

  it('coalesces within a transientKey with the slot rules, never across keys', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'one');
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'two');
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'three');
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-2', 'other');
    }

    const state = runWorkspaceStory(workspace, story);

    // The one-per-type SetTitle rule collapses conn-1's burst to its latest ...
    expect(state.transient.noteA['conn-1']).toHaveLength(1);
    expect(state.transient.noteA['conn-1'][0].payload.data).toEqual({ title: 'three' });
    // ... without reaching into conn-2's group.
    expect(state.transient.noteA['conn-2']).toHaveLength(1);
    expect(state.transient.noteA['conn-2'][0].payload.data).toEqual({ title: 'other' });
  });

  it('drop clears the key across ALL slots and the folded view reverts', () => {
    const workspace = createTestWorkspace();

    function* commits(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteSetTitle('pending title');
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'transient title');
      yield* workspace.api.noteB.askNoteTransientAddLine('conn-1', 'l1', 'b line');
      yield* workspace.api.noteA.askNoteTransientAddLine('conn-2', 'l9', 'other connection');
    }

    const before = runWorkspaceStory(workspace, () => commits());
    expect(workspace.selectors.view.noteA(before).title).toBe('transient title');
    expect(workspace.selectors.view.noteB(before).lines).toEqual([{ lineId: 'l1', text: 'b line' }]);

    function* dropStory(): AskResponse<void> {
      yield* commits();
      yield* askUIEventDocWorkspaceDropTransient('conn-1');
    }

    const after = runWorkspaceStory(workspace, dropStory);

    // conn-1 is gone from EVERY slot; conn-2 and the pending buffer are untouched.
    expect(after.transient.noteA['conn-1']).toBeUndefined();
    expect(after.transient.noteB).toEqual({});
    expect(after.transient.noteA['conn-2']).toHaveLength(1);
    expect(workspace.selectors.view.noteA(after).title).toBe('pending title');
    expect(workspace.selectors.view.noteA(after).lines).toEqual([{ lineId: 'l9', text: 'other connection' }]);
    expect(workspace.selectors.view.noteB(after).lines).toEqual([]);
  });

  it('reset clears all transient groups', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'gone');
      yield* askUIEventDocWorkspaceReset();
    }

    const state = runWorkspaceStory(workspace, story);

    expect(state.transient.noteA).toEqual({});
    expect(workspace.selectors.view.noteA(state).title).toBe('');
  });

  it('save, cancel and isDirty ignore transient entirely', () => {
    const fake = createFakeTransport([initStateEvent()]);
    const workspace = createTestWorkspace(fake.transport);

    function* story(): AskResponse<void> {
      yield* workspace.api.workspace.askInit({ noteA: identityA });
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'never saved');
      yield* workspace.api.noteA.askNoteAddLine('l1', 'saved line');
      yield* workspace.api.workspace.askSave();
      yield* workspace.api.noteA.askNoteTransientAddLine('conn-1', 'l2', 'post-save transient');
      yield* workspace.api.workspace.askCancel();
    }

    const state = runWorkspaceStory(workspace, story);

    // Save streamed only the pending line; nothing transient touched the wire.
    expect(fake.appended).toHaveLength(1);
    expect(fake.appended[0].payload.data).toEqual({ lineId: 'l1', text: 'saved line' });
    // Cancel drained nothing transient either: both of conn-1's events survive.
    expect(state.transient.noteA['conn-1']).toHaveLength(2);
    // Pending is drained and only transient remains: the workspace is not dirty.
    expect(workspace.selectors.isDirty(state)).toBe(false);
    expect(state.pending.noteA).toHaveLength(0);
  });

  it('fails loudly when a transient verb runs outside any workspace bind', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askNoteTransientSetTitle('conn-1', 'nowhere to go');
    }

    expect(() => runWorkspaceStory(workspace, story)).toThrow(/ApplyTransientEvent/);
  });

  it('keeps the persistable log transient-free: getSlotLiveEvents and liveEvents', () => {
    const workspace = createTestWorkspace();

    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceSetHistoryEvents('noteA', [initStateEvent()]);
      yield* workspace.api.noteA.askNoteSetTitle('pending');
      yield* workspace.api.noteA.askNoteTransientSetTitle('conn-1', 'transient');
    }

    const state = runWorkspaceStory(workspace, story);

    expect(getSlotLiveEvents(state, 'noteA')).toHaveLength(2); // history + pending only
    expect(workspace.selectors.liveEvents.noteA(state)).toHaveLength(2);
    expect(getSlotTransientEvents(state, 'noteA')).toHaveLength(1);
  });

  it('a transient event at a mismatched schema version throws at view read', () => {
    const workspace = createTestWorkspace();

    // Committed via the state effect directly to forge a stale version — the bind
    // always stamps the slot's own schemaVersion, so this can't happen through it.
    function* story(): AskResponse<void> {
      yield* askUIEventDocWorkspaceApplyTransientEvent('noteA', 'conn-1', eventAtVersion(serverEvent(NoteEvent.SetTitle, { title: 'v2' }, 0), 2));
    }

    const state = runWorkspaceStory(workspace, story);

    expect(() => workspace.selectors.view.noteA(state)).toThrow(/pending event/);
  });
});
