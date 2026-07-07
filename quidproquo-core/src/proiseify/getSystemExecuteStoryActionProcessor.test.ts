import { describe, expect, it } from 'vitest';

import { SystemActionType } from '../actions';
import { actionResult, actionResultError, isErroredActionResult, resolveActionResult, resolveActionResultError } from '../logic/actionLogic';
import { buildTestQpqConfig } from '../testing/configTesting';
import { buildActionProcessorList, buildTestStorySession, createStubLogger, noopDynamicModuleLoader } from '../testing/runtimeTesting';
import { ErrorTypeEnum } from '../types/ErrorTypeEnum';
import { AskResponse } from '../types/StorySession';
import { getDateNow, getRun, getSystemExecuteStoryActionProcessor, qpqPromisify } from './getSystemExecuteStoryActionProcessor';

const buildRuntimeInfo = (processors: any, payload: any = {}): any => [
  payload,
  buildTestStorySession(),
  buildActionProcessorList(processors),
  createStubLogger(),
  () => {},
  noopDynamicModuleLoader,
  {} as any,
];

describe('getDateNow', () => {
  it('returns the current time as an ISO string that round-trips', () => {
    const now = getDateNow();

    expect(now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(now).toISOString()).toBe(now);
  });
});

describe('qpqPromisify', () => {
  it('threads successful action results through the story', async () => {
    function* story(seed: string): AskResponse<string> {
      const a: string = yield { type: 'A' };
      const b: string = yield { type: 'B' };
      return `${seed}:${a}:${b}`;
    }

    const run = qpqPromisify(story, buildRuntimeInfo({ A: async () => actionResult('one'), B: async () => actionResult('two') }));

    expect(await run('seed')).toBe('seed:one:two');
  });

  it('throws when a non-returnErrors action errors', async () => {
    function* story(): AskResponse<string> {
      return yield { type: 'Fails' };
    }

    const run = qpqPromisify(story, buildRuntimeInfo({ Fails: async () => actionResultError(ErrorTypeEnum.NotFound, 'gone') }));

    await expect(run()).rejects.toThrow('gone');
  });

  it('hands a returnErrors action its either-result', async () => {
    function* story(): AskResponse<string> {
      const either = yield { type: 'Maybe', returnErrors: true };
      return either.success ? 'ok' : `caught:${either.error.errorText}`;
    }

    const run = qpqPromisify(story, buildRuntimeInfo({ Maybe: async () => actionResultError(ErrorTypeEnum.BadRequest, 'nope') }));

    expect(await run()).toBe('caught:nope');
  });
});

describe('getRun', () => {
  it('runs a single story and returns its single result', async () => {
    function* story(): AskResponse<string> {
      return yield { type: 'Echo', payload: 'hi' };
    }

    const run = getRun(buildRuntimeInfo({ Echo: async (payload: string) => actionResult(payload) }));

    expect(await run(story())).toBe('hi');
  });
});

describe('getSystemExecuteStoryActionProcessor', () => {
  it('resolves to a map containing the ExecuteStory processor', async () => {
    const map = await getSystemExecuteStoryActionProcessor(buildTestQpqConfig(), noopDynamicModuleLoader as any);

    expect(typeof map[SystemActionType.ExecuteStory]).toBe('function');
  });

  it('loads a story via the dynamic module loader and returns its result', async () => {
    const map = await getSystemExecuteStoryActionProcessor(buildTestQpqConfig(), noopDynamicModuleLoader as any);
    const processor = map[SystemActionType.ExecuteStory];

    const loadedStory = async (a: number, b: number) => a + b;
    const dynamicModuleLoader = async () => loadedStory;

    const result = await processor(
      { runtime: 'some/runtime', params: [2, 3] },
      buildTestStorySession(),
      buildActionProcessorList({}),
      createStubLogger(),
      () => {},
      dynamicModuleLoader as any,
      {} as any,
    );

    expect(isErroredActionResult(result)).toBe(false);
    expect(resolveActionResult(result)).toBe(5);
  });

  it('returns a NotFound error when the loader resolves nothing', async () => {
    const map = await getSystemExecuteStoryActionProcessor(buildTestQpqConfig(), noopDynamicModuleLoader as any);
    const processor = map[SystemActionType.ExecuteStory];

    const result = await processor(
      { runtime: 'missing', params: [] },
      buildTestStorySession(),
      buildActionProcessorList({}),
      createStubLogger(),
      () => {},
      noopDynamicModuleLoader as any,
      {} as any,
    );

    expect(isErroredActionResult(result)).toBe(true);
    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.NotFound);
  });
});
