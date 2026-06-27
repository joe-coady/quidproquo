import { buildTestQpqConfig, buildTestStorySession, EventActionType, noopDynamicModuleLoader, resolveActionResult } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getEventGetStorySessionActionProcessor } from './getEventGetStorySessionActionProcessor';

const invoke = async (eventStorySession: any, sessionCorrelation: string) => {
  const processors = await getEventGetStorySessionActionProcessor(buildTestQpqConfig(), noopDynamicModuleLoader);
  const process = processors[EventActionType.GetStorySession];
  return process(
    { eventParams: [{ storySession: eventStorySession }] } as any,
    buildTestStorySession({ correlation: sessionCorrelation }),
    {},
    undefined as any,
    () => {},
    async () => null,
    undefined as any,
  );
};

describe('getEventGetStorySessionActionProcessor (queue)', () => {
  it('merges the event story session and overrides correlation from the session', async () => {
    const result = await invoke({ depth: 2, context: { a: 1 }, correlation: 'event-corr' }, 'session-corr');

    expect(resolveActionResult(result)).toEqual({ depth: 2, context: { a: 1 }, correlation: 'session-corr' });
  });

  it('falls back to the event correlation when the session has none', async () => {
    const result = await invoke({ depth: 0, context: {}, correlation: 'event-corr' }, '');

    expect(resolveActionResult(result).correlation).toBe('event-corr');
  });
});
