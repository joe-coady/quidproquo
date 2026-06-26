import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { askUserDirectoryReadAccessToken } from './UserDirectoryReadAccessTokenActionRequester';

describe('askUserDirectoryReadAccessToken', () => {
  it('yields a ReadAccessToken action carrying the directory and expiration flag', () => {
    const { action } = captureRequester(askUserDirectoryReadAccessToken('pool', true));

    expect(action).toEqual({
      type: UserDirectoryActionType.ReadAccessToken,
      payload: { userDirectoryName: 'pool', ignoreExpiration: true },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askUserDirectoryReadAccessToken('pool', false), 'token');

    expect(returned).toBe('token');
  });
});
