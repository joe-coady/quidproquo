import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { NetworkActionType } from './NetworkActionType';
import { askNetworkRequest } from './NetworkRequestActionRequester';

describe('askNetworkRequest', () => {
  it('yields a Request action with the supplied options', () => {
    const { action } = captureRequester(
      askNetworkRequest('POST', 'https://api.test/users', { body: { name: 'a' }, headers: { 'x-key': '1' } }),
    );

    expect(action).toEqual({
      type: NetworkActionType.Request,
      payload: {
        url: 'https://api.test/users',
        method: 'POST',
        body: { name: 'a' },
        headers: { 'x-key': '1' },
        basePath: undefined,
        params: undefined,
        responseType: 'json',
      },
    });
  });

  it('defaults the responseType to json when no options are given', () => {
    const { action } = captureRequester(askNetworkRequest('GET', 'https://api.test'));

    expect(action.payload.responseType).toBe('json');
  });

  it('returns the response the runtime resolves', () => {
    const response = { status: 200, body: { ok: true } };
    const { returned } = captureRequester(askNetworkRequest('GET', 'https://api.test'), response);

    expect(returned).toBe(response);
  });
});
