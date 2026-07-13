import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { ServiceActionType } from './ServiceActionType';
import { askServiceRequest } from './ServiceRequestActionRequester';

describe('askServiceRequest', () => {
  it('yields a Request action with the service name, method and payload', () => {
    const { action } = captureRequester(askServiceRequest('billing', 'charge', { amount: 10 }));

    expect(action).toEqual({
      type: ServiceActionType.Request,
      payload: { serviceName: 'billing', method: 'charge', payload: { amount: 10 } },
    });
  });

  it('passes the response through', () => {
    const { returned } = captureRequester(askServiceRequest('billing', 'charge', {}), { ok: true });

    expect(returned).toEqual({ ok: true });
  });
});
