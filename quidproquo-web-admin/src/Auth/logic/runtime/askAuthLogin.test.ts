import {
  AuthenticateUserChallenge,
  ConfigActionType,
  ContextActionType,
  DateActionType,
  GuidActionType,
  NetworkActionType,
  runStory,
  StateActionType,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { AuthEffect } from '../authTypes';
import { askAuthLogin } from './askAuthLogin';

const baseMocks = (dispatched: string[], setParams: unknown[], networkResponse: unknown) => ({
  [StateActionType.Read]: { username: 'joe', password: 'secret' },
  [ContextActionType.Read]: { api: 'https://api', ws: 'wss://api' },
  [ConfigActionType.GetParameter]: JSON.stringify({ authenticationInfo: {} }),
  [DateActionType.Now]: '2026-06-26T00:00:00.000Z',
  [GuidActionType.New]: 'guid-1',
  [NetworkActionType.Request]: networkResponse,
  [ConfigActionType.SetParameter]: (action: { payload: unknown }) => {
    setParams.push(action.payload);
  },
  [StateActionType.Dispatch]: (action: { payload: { action: { type: string } } }) => {
    dispatched.push(action.payload.action.type);
  },
});

describe('askAuthLogin', () => {
  it('saves the token and sets auth info on a successful login', () => {
    const dispatched: string[] = [];
    const setParams: unknown[] = [];

    runStory(askAuthLogin(), baseMocks(dispatched, setParams, { status: 200, data: { challenge: AuthenticateUserChallenge.NONE } }));

    expect(setParams).toHaveLength(1);
    expect(dispatched).toContain(AuthEffect.SetAuthInfo);
  });

  it('does nothing when the login request fails', () => {
    const dispatched: string[] = [];
    const setParams: unknown[] = [];

    runStory(askAuthLogin(), baseMocks(dispatched, setParams, { status: 401, data: {} }));

    expect(setParams).toHaveLength(0);
    expect(dispatched).not.toContain(AuthEffect.SetAuthInfo);
  });
});
