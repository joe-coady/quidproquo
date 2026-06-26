import { describe, expect, it, vi } from 'vitest';

import { ConfigActionType } from '../actions/config/ConfigActionType';
import { EventActionType } from '../actions/event/EventActionType';
import { LogActionType } from '../actions/log/LogActionType';
import { SystemActionType } from '../actions/system/SystemActionType';
import { runStory, StoryError, throwsError } from '../testing/storyTesting';
import { askProcessEvent } from './askProcessEvent';

describe('askProcessEvent', () => {
  it('matches, executes the story for each record and returns the transformed response', () => {
    const result = runStory(askProcessEvent('event-arg'), {
      [ConfigActionType.GetGlobal]: 'v1',
      [EventActionType.GetRecords]: ['record-1'],
      [EventActionType.MatchStory]: { runtime: '/handlers/run::default', runtimeOptions: {} },
      [EventActionType.AutoRespond]: null,
      [EventActionType.GetStorySession]: { correlation: 'corr-1' },
      [SystemActionType.ExecuteStory]: 'story-output',
      [EventActionType.TransformResponseResult]: 'final-response',
    });

    expect(result).toBe('final-response');
  });

  it('uses the auto-respond value and skips story execution for an early exit', () => {
    const execute = vi.fn(() => 'should-not-run');

    const result = runStory(askProcessEvent('event-arg'), {
      [ConfigActionType.GetGlobal]: 'v1',
      [EventActionType.GetRecords]: ['record-1'],
      [EventActionType.MatchStory]: { runtime: '/handlers/run::default', runtimeOptions: {} },
      [EventActionType.AutoRespond]: 'early-response',
      [SystemActionType.ExecuteStory]: execute,
      [EventActionType.TransformResponseResult]: 'final-response',
    });

    expect(result).toBe('final-response');
    expect(execute).not.toHaveBeenCalled();
  });

  it('logs and throws when the response transform fails', () => {
    const log = vi.fn();

    expect(() =>
      runStory(askProcessEvent('event-arg'), {
        [ConfigActionType.GetGlobal]: 'v1',
        [EventActionType.GetRecords]: ['record-1'],
        [EventActionType.MatchStory]: { runtime: '/handlers/run::default', runtimeOptions: {} },
        [EventActionType.AutoRespond]: null,
        [EventActionType.GetStorySession]: { correlation: 'corr-1' },
        [SystemActionType.ExecuteStory]: 'story-output',
        [EventActionType.TransformResponseResult]: throwsError('Misconfigured', 'bad transform'),
        [LogActionType.Create]: log,
      }),
    ).toThrow(StoryError);

    expect(log).toHaveBeenCalledTimes(1);
  });
});
