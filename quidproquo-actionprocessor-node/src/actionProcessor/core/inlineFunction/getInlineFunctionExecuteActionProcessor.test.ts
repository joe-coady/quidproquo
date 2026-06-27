import {
  actionResultError,
  buildTestQpqConfig,
  createStreamRegistry,
  createStubLogger,
  defineInlineFunction,
  ErrorTypeEnum,
  InlineFunctionActionType,
  resolveActionResult,
  resolveActionResultError,
} from 'quidproquo-core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getInlineFunctionExecuteActionProcessor } from './getInlineFunctionExecuteActionProcessor';

const qpqConfig = buildTestQpqConfig([defineInlineFunction('/entry/fn::handler')]);

const session = { correlation: 'corr-0', depth: 0, context: {}, localContext: {} } as any;
const logger = createStubLogger();

const invoke = async (
  payload: { functionName: string; payload: unknown },
  actionProcessors: Record<string, any>,
  dynamicModuleLoader: any,
) => {
  const processors = await getInlineFunctionExecuteActionProcessor(qpqConfig, async () => null);
  const process = processors[InlineFunctionActionType.Execute] as (p: any, ...rest: any[]) => Promise<any>;
  return process(payload, session, actionProcessors, logger, undefined, dynamicModuleLoader, createStreamRegistry());
};

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getInlineFunctionExecuteActionProcessor', () => {
  it('runs the loaded story and returns its result', async () => {
    function* echoStory(input: unknown): any {
      return input;
    }

    const result = await invoke({ functionName: 'handler', payload: { value: 42 } }, {}, async () => echoStory);

    expect(resolveActionResult(result)).toEqual({ value: 42 });
  });

  it('returns NotFound when the function name is not configured', async () => {
    const result = await invoke({ functionName: 'missing', payload: {} }, {}, async () => undefined);

    const error = resolveActionResultError(result);
    expect(error.errorType).toBe(ErrorTypeEnum.NotFound);
    expect(error.errorText).toContain('missing');
  });

  it('returns NotFound when the module cannot be loaded', async () => {
    const result = await invoke({ functionName: 'handler', payload: {} }, {}, async () => null);

    const error = resolveActionResultError(result);
    expect(error.errorType).toBe(ErrorTypeEnum.NotFound);
    expect(error.errorText).toContain('Unable to dynamically load');
  });

  it('propagates a story error as an action error', async () => {
    function* failStory(): any {
      yield { type: 'Fails' };
      return 'unreachable';
    }

    const actionProcessors = { Fails: async () => actionResultError(ErrorTypeEnum.NotFound, 'boom') };

    const result = await invoke({ functionName: 'handler', payload: {} }, actionProcessors, async () => failStory);

    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.NotFound);
  });
});
