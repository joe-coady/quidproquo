import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { askUserDirectoryChangePassword } from './UserDirectoryChangePasswordActionRequester';

describe('askUserDirectoryChangePassword', () => {
  it('yields a ChangePassword action carrying the password fields', () => {
    const { action } = captureRequester(askUserDirectoryChangePassword('old', 'new', 'token'));

    expect(action).toEqual({
      type: UserDirectoryActionType.ChangePassword,
      payload: { oldPassword: 'old', newPassword: 'new', accessToken: 'token' },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askUserDirectoryChangePassword('old', 'new', 'token'), true);

    expect(returned).toBe(true);
  });
});
