import { ConfigActionType, ContextActionType, KeyValueStoreActionType, runStory, UserDirectoryActionType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askTryAuthenticateConnection } from './askTryAuthenticateConnection';

const baseConnection = { id: 'c1', requestTime: 't', requestTimeEpoch: 1, ip: '1.1.1.1' };

describe('askTryAuthenticateConnection', () => {
  it('does nothing when no user directory is configured', () => {
    let setAccessTokenCalled = false;

    runStory(askTryAuthenticateConnection('c1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [ConfigActionType.GetGlobal]: '',
      [UserDirectoryActionType.SetAccessToken]: () => {
        setAccessTokenCalled = true;
        return { userId: 'u1' };
      },
    });

    expect(setAccessTokenCalled).toBe(false);
  });

  it('sets the access token into the session when the connection has one', () => {
    let captured: any;

    runStory(askTryAuthenticateConnection('c1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [ConfigActionType.GetGlobal]: 'user-directory',
      [KeyValueStoreActionType.Query]: { items: [{ ...baseConnection, accessToken: 'token-1' }] },
      [UserDirectoryActionType.SetAccessToken]: (action: any) => {
        captured = action;
        return { userId: 'u1' };
      },
    });

    expect(captured.payload).toEqual({ userDirectoryName: 'user-directory', accessToken: 'token-1' });
  });

  it('does not set an access token when the connection has none', () => {
    let setAccessTokenCalled = false;

    runStory(askTryAuthenticateConnection('c1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [ConfigActionType.GetGlobal]: 'user-directory',
      [KeyValueStoreActionType.Query]: { items: [baseConnection] },
      [UserDirectoryActionType.SetAccessToken]: () => {
        setAccessTokenCalled = true;
        return { userId: 'u1' };
      },
    });

    expect(setAccessTokenCalled).toBe(false);
  });
});
