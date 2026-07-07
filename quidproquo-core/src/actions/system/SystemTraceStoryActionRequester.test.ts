import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { SystemActionType } from './SystemActionType';
import { askTraceStory } from './SystemTraceStoryActionRequester';

const storyResult = { correlation: 'corr-1', moduleName: 'svc' } as any;

describe('askTraceStory', () => {
  it('yields a TraceStory action with the story result and script patterns', () => {
    const { action } = captureRequester(askTraceStory(storyResult, ['/tmp/qpq-federated-code/']));

    expect(action).toEqual({
      type: SystemActionType.TraceStory,
      payload: { storyResult, scriptPatterns: ['/tmp/qpq-federated-code/'] },
    });
  });

  it('leaves script patterns undefined when omitted', () => {
    const { action } = captureRequester(askTraceStory(storyResult));

    expect(action.payload).toEqual({ storyResult, scriptPatterns: undefined });
  });

  it('returns the trace the runtime resolves', () => {
    const trace = { correlation: 'corr-1', steps: [] } as any;

    const { returned } = captureRequester(askTraceStory(storyResult), trace);

    expect(returned).toBe(trace);
  });
});
