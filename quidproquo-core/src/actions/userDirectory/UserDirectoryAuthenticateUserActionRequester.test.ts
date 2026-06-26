import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { askUserDirectoryAuthenticateUser } from './UserDirectoryAuthenticateUserActionRequester';

describe('askUserDirectoryAuthenticateUser', () => {
  it('yields a standard authentication request carrying email and password', () => {
    const { action } = captureRequester(askUserDirectoryAuthenticateUser('pool', false, 'a@b.com', 'pw'));

    expect(action).toEqual({
      type: UserDirectoryActionType.AuthenticateUser,
      payload: {
        userDirectoryName: 'pool',
        authenticateUserRequest: { isCustom: false, email: 'a@b.com', password: 'pw' },
      },
    });
  });

  it('omits the password when the request is custom', () => {
    const { action } = captureRequester(askUserDirectoryAuthenticateUser('pool', true, 'a@b.com'));

    expect(action).toEqual({
      type: UserDirectoryActionType.AuthenticateUser,
      payload: {
        userDirectoryName: 'pool',
        authenticateUserRequest: { isCustom: true, email: 'a@b.com' },
      },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askUserDirectoryAuthenticateUser('pool', false, 'a@b.com', 'pw'), { challenge: 'NONE' });

    expect(returned).toEqual({ challenge: 'NONE' });
  });
});
