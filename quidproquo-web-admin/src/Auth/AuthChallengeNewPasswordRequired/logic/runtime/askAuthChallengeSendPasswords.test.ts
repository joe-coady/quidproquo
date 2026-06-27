import {
  ConfigActionType,
  ContextActionType,
  DateActionType,
  GuidActionType,
  NetworkActionType,
  runStory,
  StateActionType,
} from 'quidproquo-core';

import { describe, expect, it, vi } from 'vitest';

import { AuthEffect } from '../../../logic/authTypes';
import { askAuthChallengeSendPasswords } from './askAuthChallengeSendPasswords';

const baseMocks = (dispatched: string[], setParams: unknown[], networkRequest: unknown) => ({
  [StateActionType.Read]: { passwordA: 'newpass', passwordB: 'newpass' },
  [ContextActionType.Read]: { api: 'https://api', ws: 'wss://api' },
  [ConfigActionType.GetParameter]: JSON.stringify({ authenticationInfo: {} }),
  [DateActionType.Now]: '2026-06-26T00:00:00.000Z',
  [GuidActionType.New]: 'guid-1',
  [NetworkActionType.Request]: networkRequest,
  [ConfigActionType.SetParameter]: (action: { payload: unknown }) => {
    setParams.push(action.payload);
  },
  [StateActionType.Dispatch]: (action: { payload: { action: { type: string } } }) => {
    dispatched.push(action.payload.action.type);
  },
});

describe('askAuthChallengeSendPasswords', () => {
  it('posts the new password and persists the resulting token', () => {
    const dispatched: string[] = [];
    const setParams: unknown[] = [];
    const networkRequest = vi.fn(() => ({ status: 200, data: { challenge: 'NONE' } }));

    runStory(askAuthChallengeSendPasswords('NEW_PASSWORD_REQUIRED', 'sess', 'joe@x.com'), baseMocks(dispatched, setParams, networkRequest));

    const networkAction = networkRequest.mock.calls[0][0] as { payload: { url: string; body: { newPassword: string } } };
    expect(networkAction.payload.url).toBe('/challenge');
    expect(networkAction.payload.body.newPassword).toBe('newpass');
    expect(dispatched).toContain(AuthEffect.SetAuthInfo);
  });

  it('returns without saving when the challenge request fails', () => {
    const dispatched: string[] = [];
    const setParams: unknown[] = [];

    runStory(askAuthChallengeSendPasswords('NEW_PASSWORD_REQUIRED', 'sess', 'joe@x.com'), baseMocks(dispatched, setParams, { status: 400, data: {} }));

    expect(setParams).toHaveLength(0);
  });
});
