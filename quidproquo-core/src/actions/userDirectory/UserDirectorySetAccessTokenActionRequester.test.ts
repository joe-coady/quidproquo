import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { askUserDirectorySetAccessToken } from './UserDirectorySetAccessTokenActionRequester';

describe('askUserDirectorySetAccessToken', () => {
  it('yields a SetAccessToken action carrying the token and directory', () => {
    const { action } = captureRequester(askUserDirectorySetAccessToken('pool', 'token'));

    expect(action).toEqual({
      type: UserDirectoryActionType.SetAccessToken,
      payload: { accessToken: 'token', userDirectoryName: 'pool' },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askUserDirectorySetAccessToken('pool', 'token'), undefined);

    expect(returned).toBeUndefined();
  });
});
