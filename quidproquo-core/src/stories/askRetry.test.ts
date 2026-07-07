import { describe, expect, it, vi } from 'vitest';

import { ConfigActionType } from '../actions/config/ConfigActionType';
import { askConfigGetParameter } from '../actions/config/ConfigGetParameterActionRequester';
import { PlatformActionType } from '../actions/platform/PlatformActionType';
import { expectError, runStory, throwsError } from '../testing/storyTesting';
import { AskResponse } from '../types';
import { askRetry } from './askRetry';

function* loadConfig(): AskResponse<string> {
  return yield* askConfigGetParameter('flaky-param');
}

describe('askRetry', () => {
  it('returns the success result without delaying when the logic succeeds first try', () => {
    const delay = vi.fn();

    const result = runStory(askRetry(loadConfig, 3, 250), {
      [ConfigActionType.GetParameter]: 'ok',
      [PlatformActionType.Delay]: delay,
    });

    expect(result).toEqual({ success: true, result: 'ok' });
    expect(delay).not.toHaveBeenCalled();
  });

  it('retries until the logic succeeds, delaying between attempts', () => {
    let attempt = 0;
    const delay = vi.fn();

    const result = runStory(askRetry(loadConfig, 3, 250), {
      [ConfigActionType.GetParameter]: () => (++attempt < 3 ? throwsError('Throttling', 'slow down') : 'ok'),
      [PlatformActionType.Delay]: delay,
    });

    expect(result).toEqual({ success: true, result: 'ok' });
    expect(attempt).toBe(3);
    expect(delay).toHaveBeenCalledTimes(2);
  });

  it('gives up after maxRetries and returns the last failure', () => {
    const result = runStory(askRetry(loadConfig, 2, 250), {
      [ConfigActionType.GetParameter]: throwsError('Throttling', 'still slow'),
      [PlatformActionType.Delay]: undefined,
    });

    expect(expectError(result).errorText).toBe('still slow');
  });

  it('stops immediately for an error type not in the retry list', () => {
    const config = vi.fn(() => throwsError('FatalError', 'nope'));

    const result = runStory(askRetry(loadConfig, 5, 250, ['Throttling']), {
      [ConfigActionType.GetParameter]: config,
    });

    expect(result.success).toBe(false);
    expect(config).toHaveBeenCalledTimes(1);
  });
});
