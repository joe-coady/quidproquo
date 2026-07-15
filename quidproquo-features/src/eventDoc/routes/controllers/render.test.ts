import { ConfigActionType, DateActionType, InlineFunctionActionType, KeyValueStoreActionType, QpqIsoDateTime, runStory } from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

import { describe, expect, it } from 'vitest';

import { buildEventDocStore } from '../../context/buildEventDocStore';
import { buildEventDocStoreGlobals } from '../../globals/buildEventDocStoreGlobals';
import { EventDocEvent, EventDocRenderInput, EventDocRenderKind, EventDocRenderMode, EventDocSummary, EventDocVersion } from '../../models';
import { EventDocStoredEvent } from '../../types/EventDocStoredEvent';
import { render } from './render';

// The route — not the renderer — is what applies renderMode/effectiveAt. It hands the inline
// function an already-resolved log plus the version behind it, because a renderer cannot derive the
// publish moment from events alone (it needs version.publishedAt to resolve ITS links as of then).
// These pin that contract: the params are honoured here, and a published request never silently
// degrades to draft content.

const DOC_ID = 'doc-1';
const RENDERER_FN = 'renderTemplate';
const REQUEST_NOW = '2026-07-15T00:00:00.000Z';

const store = buildEventDocStore({ storeName: 'templates', type: 'template', eventRenderer: RENDERER_FN });

const buildEvent = (index: number): EventDocEvent => ({
  type: 'SET_BODY',
  payload: {
    data: { body: `body-${index}` },
    metadata: {
      version: 1,
      clientMessageId: `msg-${index}`,
      createdBy: { userId: 'user-1' } as EventDocEvent['payload']['metadata']['createdBy'],
      createdAt: '2026-01-01T00:00:00.000Z' as QpqIsoDateTime,
      index,
    },
  },
});

const EVENTS: EventDocEvent[] = [0, 1, 2, 3].map(buildEvent);

const storedEvents: EventDocStoredEvent[] = EVENTS.map((event) => ({
  pk: DOC_ID,
  sk: event.payload.metadata.index,
  data: event,
}));

// v1 published 03-01 with head @1 — so a published render must cut events 2 and 3.
const VERSION_1: EventDocVersion = {
  version: 1,
  eventIndex: 1,
  publishedAt: '2026-03-01T00:00:00.000Z' as QpqIsoDateTime,
  effectiveFrom: '2026-03-01T00:00:00.000Z' as QpqIsoDateTime,
};
const VERSION_DRAFT: EventDocVersion = { version: 2, eventIndex: 3 };

const buildSummary = (versions: EventDocVersion[]): EventDocSummary => ({
  type: 'template',
  id: DOC_ID,
  code: 'tpl-1',
  name: 'Template One',
  createdAt: '2026-01-01T00:00:00.000Z' as QpqIsoDateTime,
  updatedAt: '2026-01-01T00:00:00.000Z' as QpqIsoDateTime,
  createdBy: 'user-1',
  updatedBy: 'user-1',
  versions,
});

const httpEvent = (query: Record<string, string>): HTTPEvent => ({
  path: `/templates/${DOC_ID}/render`,
  query,
  body: '',
  headers: {},
  method: 'GET',
  correlation: 'test-correlation',
  sourceIp: '127.0.0.1',
  isBase64Encoded: false,
});

// Captures what the route hands the renderer — the thing under test.
const renderWith = (query: Record<string, string>, versions: EventDocVersion[] = [VERSION_1, VERSION_DRAFT]) => {
  const globals = buildEventDocStoreGlobals(store);
  const renderInputs: EventDocRenderInput[] = [];

  const response = runStory(render(httpEvent(query), { id: DOC_ID }), {
    [ConfigActionType.GetGlobal]: (action: { payload: { globalName: string } }) => {
      if (!(action.payload.globalName in globals)) {
        throw new Error(`Global config ${action.payload.globalName} not found`);
      }
      return globals[action.payload.globalName];
    },
    [DateActionType.Now]: () => REQUEST_NOW,
    [KeyValueStoreActionType.Query]: (action: { payload: { keyValueStoreName: string } }) => {
      if (action.payload.keyValueStoreName === store.eventsStoreName) {
        return { items: storedEvents, nextPageKey: undefined };
      }
      return { items: [buildSummary(versions)], nextPageKey: undefined };
    },
    [InlineFunctionActionType.Execute]: (action: { payload: { functionName: string; payload: EventDocRenderInput } }) => {
      expect(action.payload.functionName).toBe(RENDERER_FN);
      renderInputs.push(action.payload.payload);
      return { kind: EventDocRenderKind.Html, html: '<p>rendered</p>' };
    },
  });

  return { response, renderInput: renderInputs[0] };
};

describe('render route', () => {
  it('hands the renderer the whole log and no version for a draft render', () => {
    const { renderInput } = renderWith({ renderMode: EventDocRenderMode.Draft });

    expect(renderInput.events.map((event) => event.payload.metadata.index)).toEqual([0, 1, 2, 3]);
    expect(renderInput.version).toBeUndefined();
  });

  it('defaults to the whole log when no mode is given', () => {
    const { renderInput } = renderWith({});

    expect(renderInput.events.map((event) => event.payload.metadata.index)).toEqual([0, 1, 2, 3]);
    expect(renderInput.version).toBeUndefined();
  });

  it('hands the renderer the version slice and the version itself for a published render', () => {
    const { renderInput } = renderWith({ renderMode: EventDocRenderMode.Published });

    // Truncated at v1's head — the draft edits (2, 3) must not reach a published render.
    expect(renderInput.events.map((event) => event.payload.metadata.index)).toEqual([0, 1]);
    // The version is what carries publishedAt, the clock the renderer resolves its links at.
    expect(renderInput.version).toEqual(VERSION_1);
  });

  it('resolves the published version as of an explicit effectiveAt, not the request time', () => {
    // v1 only takes effect 03-01, so as of 02-01 nothing is published — which can only be true if
    // effectiveAt drove the selection rather than the request clock (07-15, where v1 IS effective).
    expect(() => renderWith({ renderMode: EventDocRenderMode.Published, effectiveAt: '2026-02-01T00:00:00.000Z' })).toThrow(
      'No published version is effective as of 2026-02-01T00:00:00.000Z',
    );
  });

  it('fails rather than falling back to the draft when nothing is published', () => {
    expect(() => renderWith({ renderMode: EventDocRenderMode.Published }, [VERSION_DRAFT])).toThrow('No published version is effective as of');
  });
});
