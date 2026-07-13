import { describe, expect, it } from 'vitest';

import { WebSocketQueueClientMessageEventType } from './WebSocketQueueClientMessageEventType';

describe('WebSocketQueueClientMessageEventType', () => {
  it('names each client message event with its namespaced value', () => {
    expect(WebSocketQueueClientMessageEventType.Authenticate).toBe('Qpq/WebSocketQueue/Authenticate');
    expect(WebSocketQueueClientMessageEventType.Unauthenticate).toBe('Qpq/WebSocketQueue/Unauthenticate');
    expect(WebSocketQueueClientMessageEventType.Ping).toBe('Qpq/WebSocketQueue/Ping');
  });

  it('exposes exactly the three client message events', () => {
    expect(Object.values(WebSocketQueueClientMessageEventType)).toEqual([
      'Qpq/WebSocketQueue/Authenticate',
      'Qpq/WebSocketQueue/Unauthenticate',
      'Qpq/WebSocketQueue/Ping',
    ]);
  });
});
