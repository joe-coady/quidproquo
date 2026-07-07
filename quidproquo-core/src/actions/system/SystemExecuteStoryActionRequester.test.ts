import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { SystemActionType } from './SystemActionType';
import { askExecuteStory } from './SystemExecuteStoryActionRequester';

describe('askExecuteStory', () => {
  it('yields an ExecuteStory action with runtime, params and session', () => {
    const runtime = '/handlers/greet::default' as const;
    const params = ['Ada', 42] as [string, number];
    const storySession = { correlation: 'corr-1' } as any;

    const { action } = captureRequester(askExecuteStory(runtime, params, storySession));

    expect(action).toEqual({
      type: SystemActionType.ExecuteStory,
      payload: { runtime, params, storySession },
    });
  });

  it('leaves the session undefined when omitted', () => {
    const runtime = '/handlers/greet::default' as const;

    const { action } = captureRequester(askExecuteStory(runtime, ['Ada']));

    expect(action.payload).toEqual({ runtime, params: ['Ada'], storySession: undefined });
  });

  it('returns the story output the runtime resolves', () => {
    const runtime = '/handlers/greet::default' as const;

    const { returned } = captureRequester(askExecuteStory(runtime, ['Ada']), 'Hello Ada');

    expect(returned).toBe('Hello Ada');
  });
});
