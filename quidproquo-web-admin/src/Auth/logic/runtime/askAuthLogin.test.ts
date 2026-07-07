import {
  AuthenticateUserChallenge,
  ContextActionType,
  DateActionType,
  GuidActionType,
  NetworkActionType,
  runStory,
  StateActionType,
} from 'quidproquo-core';

import { beforeEach, describe, expect, it } from 'vitest';

import { clearInMemoryAuthToken, getInMemoryAuthToken } from '../../../platformLogic';
import { AuthEffect } from '../authTypes';
import { askAuthLogin } from './askAuthLogin';

const baseMocks = (dispatched: string[], networkResponse: unknown) => ({
  [StateActionType.Read]: { username: 'joe', password: 'secret' },
  [ContextActionType.Read]: { api: 'https://api', ws: 'wss://api' },
  [DateActionType.Now]: '2026-06-26T00:00:00.000Z',
  [GuidActionType.New]: 'guid-1',
  [NetworkActionType.Request]: networkResponse,
  [StateActionType.Dispatch]: (action: { payload: { action: { type: string } } }) => {
    dispatched.push(action.payload.action.type);
  },
});

describe('askAuthLogin', () => {
  beforeEach(() => {
    clearInMemoryAuthToken();
  });

  it('saves the token and sets auth info on a successful login', () => {
    const dispatched: string[] = [];
    const loginResponse = { challenge: AuthenticateUserChallenge.NONE, authenticationInfo: { accessToken: 'tok' } };

    runStory(askAuthLogin(), baseMocks(dispatched, { status: 200, data: loginResponse }));

    expect(getInMemoryAuthToken()).toEqual(loginResponse);
    expect(dispatched).toContain(AuthEffect.SetAuthInfo);
  });

  it('does nothing when the login request fails', () => {
    const dispatched: string[] = [];

    runStory(askAuthLogin(), baseMocks(dispatched, { status: 401, data: {} }));

    expect(getInMemoryAuthToken()).toEqual({ challenge: AuthenticateUserChallenge.NONE });
    expect(dispatched).not.toContain(AuthEffect.SetAuthInfo);
  });
});
