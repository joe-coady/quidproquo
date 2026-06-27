import { buildTestQpqConfig, buildTestStorySession, createStubLogger, ErrorTypeEnum, SystemActionType } from 'quidproquo-core';

import { describe, expect, it, vi } from 'vitest';

import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getDateNow, getSystemExecuteStoryActionProcessor } from './getSystemExecuteStoryActionProcessor';

const resolveProcessor = async () => {
  const processors = await getSystemExecuteStoryActionProcessor(buildTestQpqConfig(), {} as any);
  return processors[SystemActionType.ExecuteStory];
};

describe('getDateNow', () => {
  it('returns an ISO timestamp', () => {
    expect(getDateNow()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('getSystemExecuteStoryActionProcessor', () => {
  it('returns a NotFound error when the runtime module cannot be loaded', async () => {
    const processor = await resolveProcessor();
    const loader = vi.fn().mockResolvedValue(null);

    const [, error] = await invokeProcessor(processor, { runtime: 'a/b::fn', params: [] }, { session: buildTestStorySession(), logger: createStubLogger(), updateSession: vi.fn(), dynamicModuleLoader: loader });

    expect(error?.errorType).toBe(ErrorTypeEnum.NotFound);
  });

  it('runs the loaded story and returns its result', async () => {
    const processor = await resolveProcessor();
    const story = function* () {
      return 'done';
    };
    const loader = vi.fn().mockResolvedValue(story);

    const result = await invokeProcessor(processor, { runtime: 'a/b::fn', params: [] }, { session: buildTestStorySession(), logger: createStubLogger(), updateSession: vi.fn(), dynamicModuleLoader: loader });

    expect(result).toEqual(['done']);
  });
});
