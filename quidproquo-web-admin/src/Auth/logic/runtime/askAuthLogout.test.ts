import { AuthenticateUserChallenge, ConfigActionType, ConfigSetParameterAction, runStory, StateActionType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { AuthEffect } from '../authTypes';
import { askAuthLogout } from './askAuthLogout';

describe('askAuthLogout', () => {
  it('clears the stored auth token and resets the auth state', () => {
    const dispatched: { type: string; payload: unknown }[] = [];
    let saved: { parameterName: string; parameterValue: string } | undefined;

    runStory(askAuthLogout(), {
      [ConfigActionType.GetParameter]: JSON.stringify({ authenticationInfo: { accessToken: 'tok', refreshToken: 'ref' } }),
      [ConfigActionType.SetParameter]: (action: ConfigSetParameterAction) => {
        saved = action.payload;
      },
      [StateActionType.Dispatch]: (action: { payload: { action: { type: string; payload: unknown } } }) => {
        dispatched.push(action.payload.action);
      },
    });

    expect(saved?.parameterName).toBe('authToken');
    expect(JSON.parse(saved!.parameterValue)).toEqual({ challenge: AuthenticateUserChallenge.NONE });

    expect(dispatched).toContainEqual({ type: AuthEffect.SetPassword, payload: '' });
    expect(dispatched).toContainEqual({ type: AuthEffect.SetAuthInfo, payload: { challenge: AuthenticateUserChallenge.NONE } });
  });
});
