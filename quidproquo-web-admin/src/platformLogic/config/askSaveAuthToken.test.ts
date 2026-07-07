import { AuthenticateUserChallenge, AuthenticateUserResponse, ConfigActionType, ConfigSetParameterAction, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askSaveAuthToken } from './askSaveAuthToken';

describe('askSaveAuthToken', () => {
  it('persists the new auth token as the authToken parameter', () => {
    const newResponse = {
      challenge: AuthenticateUserChallenge.NONE,
      authenticationInfo: { accessToken: 'new' },
    } as unknown as AuthenticateUserResponse;

    let saved: { parameterName: string; parameterValue: string } | undefined;

    runStory(askSaveAuthToken(newResponse), {
      [ConfigActionType.GetParameter]: JSON.stringify({ authenticationInfo: { refreshToken: 'old' } }),
      [ConfigActionType.SetParameter]: (action: ConfigSetParameterAction) => {
        saved = action.payload;
      },
    });

    expect(saved?.parameterName).toBe('authToken');
    expect(JSON.parse(saved!.parameterValue)).toEqual(newResponse);
  });
});
