import { AuthenticateUserChallenge, ConfigActionType, ErrorTypeEnum, runStory, throwsError } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askLoadAuthToken } from './askLoadAuthToken';

describe('askLoadAuthToken', () => {
  it('parses the stored auth token parameter', () => {
    const stored = { challenge: AuthenticateUserChallenge.NONE, authenticationInfo: { accessToken: 'tok' } };

    const result = runStory(askLoadAuthToken(), {
      [ConfigActionType.GetParameter]: JSON.stringify(stored),
    });

    expect(result).toEqual(stored);
  });

  it('returns a NONE challenge when the parameter is missing', () => {
    const result = runStory(askLoadAuthToken(), {
      [ConfigActionType.GetParameter]: throwsError(ErrorTypeEnum.NotFound, 'missing'),
    });

    expect(result).toEqual({ challenge: AuthenticateUserChallenge.NONE });
  });
});
