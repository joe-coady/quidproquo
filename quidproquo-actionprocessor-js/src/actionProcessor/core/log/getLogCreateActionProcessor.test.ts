import { buildTestQpqConfig, LogActionType, LogLevelEnum, resolveActionResult } from 'quidproquo-core';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { getLogCreateActionProcessor } from './getLogCreateActionProcessor';

describe('getLogCreateActionProcessor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const resolve = async () =>
    (await getLogCreateActionProcessor(buildTestQpqConfig(), async () => null))[LogActionType.Create] as (p: any, ...rest: any[]) => Promise<any>;

  it('logs the level and message and succeeds', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const processor = await resolve();

    const result = await processor({ msg: 'hello', logLevel: LogLevelEnum.Info }, undefined as any);

    expect(log).toHaveBeenCalledWith(`${LogLevelEnum.Info}: hello`);
    expect(resolveActionResult(result)).toBeUndefined();
  });

  it('appends the data argument when provided', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const processor = await resolve();
    const data = { userId: '1' };

    await processor({ msg: 'hello', logLevel: LogLevelEnum.Error, data }, undefined as any);

    expect(log).toHaveBeenCalledWith(`${LogLevelEnum.Error}: hello`, data);
  });
});
