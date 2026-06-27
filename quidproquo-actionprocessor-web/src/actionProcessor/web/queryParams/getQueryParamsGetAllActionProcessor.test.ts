// @vitest-environment jsdom
import { buildTestQpqConfig, noopDynamicModuleLoader } from 'quidproquo-core';
import { QueryParamsActionType } from 'quidproquo-web';

import { beforeEach, describe, expect, it } from 'vitest';

import { getQueryParamsGetAllActionProcessor } from './getQueryParamsGetAllActionProcessor';

const getProcessor = async () => {
  const processors = await getQueryParamsGetAllActionProcessor(buildTestQpqConfig(), noopDynamicModuleLoader);
  return processors[QueryParamsActionType.GetAll] as (p: any, ...rest: any[]) => Promise<any>;
};

describe('getQueryParamsGetAllActionProcessor', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/?tag=a&tag=b&other=c');
  });

  it('groups every value by key', async () => {
    const processor = await getProcessor();

    const [result] = await processor(undefined);

    expect(result).toEqual({ tag: ['a', 'b'], other: ['c'] });
  });

  it('returns an empty object when there are no query params', async () => {
    window.history.replaceState(null, '', '/');
    const processor = await getProcessor();

    const [result] = await processor(undefined);

    expect(result).toEqual({});
  });
});
