import { Action, runStory } from 'quidproquo-core';
import { ApiActionType, ApiRequestActionPayload } from 'quidproquo-webserver';

import { describe, expect, it } from 'vitest';

import { EventDocEvent, EventDocEventInput } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { askEventDocWorkspaceApiAppendEvent } from './askEventDocWorkspaceApiAppendEvent';
import { askEventDocWorkspaceApiFetchEvents } from './askEventDocWorkspaceApiFetchEvents';

// Sortable event ids are opaque strings ordered lexicographically; padded counters stand in.
const eventId = (n: number): string => String(n).padStart(4, '0');

const identity: EventDocWorkspaceDocumentIdentity = { serviceName: 'notes', basePath: '/notes', id: 'doc-1' };

const storedEvent = (index: number): EventDocEvent => ({
  type: 'NOTE_SET_TITLE',
  payload: {
    data: { title: `title-${index}` },
    metadata: {
      version: 1,
      clientMessageId: `m-${index}`,
      createdBy: { userId: 'server', userDisplayName: 'Server' },
      createdAt: '2026-07-17T00:00:00.000Z',
      eventId: eventId(index),
    },
  },
});

describe('eventDocWorkspaceApiTransport', () => {
  it('fetches the full log across pages via the feature events route', () => {
    const requests: ApiRequestActionPayload<unknown>[] = [];

    // Two pages: the first returns a nextPageKey, the second closes the loop.
    const respondWithPage = (action: Action<ApiRequestActionPayload<unknown>>) => {
      requests.push(action.payload!);
      const isFirstPage = action.payload!.params?.nextPageKey === undefined;

      return isFirstPage
        ? { status: 200, data: { items: [storedEvent(0), storedEvent(1)], nextPageKey: 'page-2' } }
        : { status: 200, data: { items: [storedEvent(2)] } };
    };

    const events = runStory(askEventDocWorkspaceApiFetchEvents(identity), {
      [ApiActionType.Request]: respondWithPage,
    });

    expect(events.map((event) => event.payload.metadata.eventId)).toEqual([eventId(0), eventId(1), eventId(2)]);
    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({ service: 'notes', method: 'GET', endpoint: '/v1/notes/doc-1/events' });
    expect(requests[1].params).toMatchObject({ nextPageKey: 'page-2' });
  });

  it('passes afterEventId through for incremental tail pulls', () => {
    const requests: ApiRequestActionPayload<unknown>[] = [];

    const respondEmpty = (action: Action<ApiRequestActionPayload<unknown>>) => {
      requests.push(action.payload!);
      return { status: 200, data: { items: [] } };
    };

    runStory(askEventDocWorkspaceApiFetchEvents(identity, eventId(7)), {
      [ApiActionType.Request]: respondEmpty,
    });

    expect(requests[0].params).toMatchObject({ afterEventId: eventId(7) });
  });

  it('POSTs an append and returns the stored event', () => {
    const input: EventDocEventInput = {
      type: 'NOTE_SET_TITLE',
      payload: { data: { title: 'hello' }, metadata: { version: 1, clientMessageId: 'm-9' } },
    };

    const requests: ApiRequestActionPayload<unknown>[] = [];

    const respondWithStored = (action: Action<ApiRequestActionPayload<unknown>>) => {
      requests.push(action.payload!);
      return { status: 200, data: storedEvent(3) };
    };

    const stored = runStory(askEventDocWorkspaceApiAppendEvent(identity, input), {
      [ApiActionType.Request]: respondWithStored,
    });

    expect(requests[0]).toMatchObject({ service: 'notes', method: 'POST', endpoint: '/v1/notes/doc-1/events', body: input });
    expect(stored.payload.metadata.eventId).toBe(eventId(3));
  });

  it('throws on a non-2xx response', () => {
    const respondServerError = () => ({ status: 500, data: undefined });

    expect(() =>
      runStory(askEventDocWorkspaceApiFetchEvents(identity), {
        [ApiActionType.Request]: respondServerError,
      }),
    ).toThrow(/Failed to load events \(500\)/);
  });
});
