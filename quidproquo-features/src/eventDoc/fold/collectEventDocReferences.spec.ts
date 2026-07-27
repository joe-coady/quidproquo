import { QpqReducer } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { createEventDocDefinition } from '../definition/createEventDocDefinition';
import { EventDocDocument, EventDocEffect, EventDocEvent, EventDocLink, EventDocLinkMode } from '../models';
import { createEventDocInitialDocumentState } from './createEventDocInitialDocumentState';

const SERVICE = 'template';
const STYLE_TYPE = 'style';

const LATEST_VERSION = 2;

// v1 called the field `styleList`; v2 renamed it to `styles`. The rename lives in the migration, and
// the collector is written against v2 only - that pairing is the whole point of these tests.
type StyleDocV1 = EventDocDocument & { styleList: EventDocLink[] };
type StyleDocV2 = EventDocDocument & { styles: EventDocLink[] };

const link = (id: string): EventDocLink => ({
  eventDocService: SERVICE,
  eventDocType: STYLE_TYPE,
  id,
  mode: EventDocLinkMode.Latest,
});

const event = (index: number, version: number, type: string, data: unknown): EventDocEvent => ({
  type,
  payload: {
    data,
    metadata: {
      version,
      clientMessageId: `msg-${index}`,
      createdBy: { userId: 'author-1', userDisplayName: 'Author One' },
      createdAt: `2026-07-27T00:00:0${index}.000Z`,
      index,
    },
  },
});

const initEvent = (version: number): EventDocEvent => event(0, version, EventDocEffect.InitState, { id: 'doc-1', code: 'doc', name: 'Doc' });

// One reducer per version, each seeing its own shape - the same version-routed arrangement a real
// doc type has. INIT_STATE resets to the EVENT's version's initial shape, which is how a v1 log ends
// up with a v1-shaped accumulator even though the seed is the latest shape (see foldEventDocLog).
const reducer: QpqReducer<StyleDocV2, EventDocEvent> = (state, incoming) => {
  if (incoming.payload.metadata.version === 1) {
    if (incoming.type === EventDocEffect.InitState) {
      return [{ ...createEventDocInitialDocumentState(1), styleList: [] } as unknown as StyleDocV2, true];
    }

    const v1 = state as unknown as StyleDocV1;

    if (incoming.type === 'ADD_STYLE') {
      return [{ ...v1, styleList: [...v1.styleList, incoming.payload.data as EventDocLink] } as unknown as StyleDocV2, true];
    }

    if (incoming.type === 'REMOVE_STYLE') {
      return [
        { ...v1, styleList: v1.styleList.filter((entry) => entry.id !== (incoming.payload.data as EventDocLink).id) } as unknown as StyleDocV2,
        true,
      ];
    }

    return [state, false];
  }

  if (incoming.type === EventDocEffect.InitState) {
    return [createInitialViewState(), true];
  }

  if (incoming.type === 'ADD_STYLE') {
    return [{ ...state, styles: [...state.styles, incoming.payload.data as EventDocLink] }, true];
  }

  return [state, false];
};

const createInitialViewState = (): StyleDocV2 => ({
  ...createEventDocInitialDocumentState(LATEST_VERSION),
  styles: [],
});

const definition = createEventDocDefinition<StyleDocV2, Record<string, never>>({
  schemaVersion: LATEST_VERSION,
  foldReducer: reducer,
  createInitialViewState,
  migrations: {
    2: (state) => {
      const { styleList, ...rest } = state as StyleDocV1;

      return { ...rest, styles: styleList } as StyleDocV2;
    },
  },
  references: (view) => view.styles,
  api: {},
});

describe('collectEventDocReferences', () => {
  it('finds references in a log authored entirely at an older schema version', () => {
    // The regression this exists for: collecting from the raw accumulator would read `styles` off a
    // v1-shaped state, get undefined, and silently return an EMPTY manifest.
    const events = [initEvent(1), event(1, 1, 'ADD_STYLE', link('style-a'))];

    expect(definition.collectReferences(events).map((reference) => reference.id)).toEqual(['style-a']);
  });

  it('keeps a reference that a later event removed', () => {
    // An older version of this doc still renders with style-a, so style-a still has to travel.
    const events = [initEvent(1), event(1, 1, 'ADD_STYLE', link('style-a')), event(2, 1, 'REMOVE_STYLE', link('style-a'))];

    expect(definition.collectReferences(events).map((reference) => reference.id)).toEqual(['style-a']);
    // ...and it is genuinely gone from the current state, which is what the renderer sees today.
    expect(definition.fold(events).styles).toEqual([]);
  });

  it('unions across the version boundary and dedupes', () => {
    const events = [
      initEvent(1),
      event(1, 1, 'ADD_STYLE', link('style-a')),
      event(2, 2, 'ADD_STYLE', link('style-b')),
      event(3, 2, 'ADD_STYLE', link('style-a')),
    ];

    expect(definition.collectReferences(events).map((reference) => reference.id)).toEqual(['style-a', 'style-b']);
  });

  it('drops references a migration removed, so they are never promoted', () => {
    // A migration that discards the concept takes the links with it. The renderer stops seeing them
    // too, so the collector agreeing is the correct behaviour, not a miss.
    const droppingDefinition = createEventDocDefinition<StyleDocV2, Record<string, never>>({
      schemaVersion: LATEST_VERSION,
      foldReducer: reducer,
      createInitialViewState,
      migrations: { 2: (state) => ({ ...(state as StyleDocV1), styles: [] }) as StyleDocV2 },
      references: (view) => view.styles,
      api: {},
    });

    const events = [initEvent(1), event(1, 1, 'ADD_STYLE', link('style-a'))];

    expect(droppingDefinition.collectReferences(events)).toEqual([]);
  });

  it('is empty for a doc type that declares no references', () => {
    const leaf = createEventDocDefinition<StyleDocV2, Record<string, never>>({
      schemaVersion: LATEST_VERSION,
      foldReducer: reducer,
      createInitialViewState,
      api: {},
    });

    expect(leaf.collectReferences([initEvent(2), event(1, 2, 'ADD_STYLE', link('style-a'))])).toEqual([]);
  });
});
