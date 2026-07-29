import { describe, expect, it } from 'vitest';

import { AdminSessionEventType } from './effects/session/AdminSessionEventType';
import { SessionLogEffect } from './effects/sessionLog/SessionLogEffect';
import { makeSessionEvent } from './testHelpers/makeSessionEvent';
import { createDefaultAdminSearchParams } from './AdminSessionState';
import { sessionLogReducer } from './sessionLogReducer';
import { createInitialSessionLogState, SessionLogState } from './SessionLogState';

const searchEvent = (info: string, clientMessageId: string) =>
  makeSessionEvent(AdminSessionEventType.searchParamsChanged, { search: { ...createDefaultAdminSearchParams(), info } }, 0, { clientMessageId });

const appended = (state: SessionLogState, event: ReturnType<typeof searchEvent>): SessionLogState => {
  const [next, handled] = sessionLogReducer(state, { type: SessionLogEffect.eventAppended, payload: event });
  expect(handled).toBe(true);
  return next;
};

describe('sessionLogReducer', () => {
  it('keeps appended events in order without assigning positions', () => {
    let state = createInitialSessionLogState();

    // Distinct ids, because the events now arrive already minted rather than being numbered
    // by the reducer.
    state = appended(state, makeSessionEvent(AdminSessionEventType.tabChanged, { tab: 1, tabName: 'Logs' }, 0, { clientMessageId: 'a' }));
    state = appended(state, makeSessionEvent(AdminSessionEventType.correlationOpened, { correlationId: 'c' }, 1, { clientMessageId: 'b' }));

    // Each event carries the sortable id it was minted with, so the buffer is ordered without
    // anything renumbering it.
    const ids = state.pendingEvents.map((event) => event.payload.metadata.eventId);
    expect(ids).toEqual([...ids].sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('coalesces consecutive pending events of a coalescable type', () => {
    let state = createInitialSessionLogState();

    state = appended(state, searchEvent('a', 'cm-1'));
    state = appended(state, searchEvent('ab', 'cm-2'));
    state = appended(state, searchEvent('abc', 'cm-3'));

    expect(state.pendingEvents).toHaveLength(1);
    expect((state.pendingEvents[0].payload.data as { search: { info: string } }).search.info).toBe('abc');
    expect(state.pendingEvents[0].payload.metadata.clientMessageId).toBe('cm-3');
  });

  it('never coalesces into the head while the flush has it in flight', () => {
    let state = createInitialSessionLogState();

    state = appended(state, searchEvent('a', 'cm-1'));
    [state] = sessionLogReducer(state, { type: SessionLogEffect.flushStarted, payload: undefined });
    state = appended(state, searchEvent('ab', 'cm-2'));

    expect(state.pendingEvents).toHaveLength(2);
    expect(state.pendingEvents[0].payload.metadata.clientMessageId).toBe('cm-1');
  });

  it('moves the acked event to the log, leaving the rest pending and in order', () => {
    let state = createInitialSessionLogState();

    state = appended(state, makeSessionEvent(AdminSessionEventType.tabChanged, { tab: 1, tabName: 'Logs' }, 0, { clientMessageId: 'a' }));
    state = appended(state, makeSessionEvent(AdminSessionEventType.correlationOpened, { correlationId: 'c' }, 1, { clientMessageId: 'b' }));

    // The server stamps its own id; nothing about the remaining pending events depends on it.
    const storedEvent = makeSessionEvent(AdminSessionEventType.tabChanged, { tab: 1, tabName: 'Logs' }, 4, { clientMessageId: 'a' });

    const [next] = sessionLogReducer(state, {
      type: SessionLogEffect.eventSaved,
      payload: { clientMessageId: 'a', storedEvent },
    });

    expect(next.events).toEqual([storedEvent]);
    expect(next.pendingEvents).toHaveLength(1);
    expect(next.pendingEvents[0].payload.metadata.clientMessageId).toBe('b');
    // Untouched: the pending event keeps the id it was minted with.
    expect(next.pendingEvents[0].payload.metadata.eventId).toBe(state.pendingEvents[1].payload.metadata.eventId);
    expect(next.flush).toEqual({ inFlight: false, lastError: null, retryCount: 0 });
  });

  it('tracks flush failures with a growing retry count', () => {
    let state = createInitialSessionLogState();

    [state] = sessionLogReducer(state, { type: SessionLogEffect.flushFailed, payload: { errorText: 'boom' } });
    [state] = sessionLogReducer(state, { type: SessionLogEffect.flushFailed, payload: { errorText: 'boom again' } });

    expect(state.flush).toEqual({ inFlight: false, lastError: 'boom again', retryCount: 2 });
  });
});
