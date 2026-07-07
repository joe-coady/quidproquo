import { describe, expect, it } from 'vitest';

import { sharedQueryParamsLogic } from './logic/runtime';
import { sharedQueryParamsInitalState } from './logic';
import { sharedQueryParamsRuntime } from './sharedQueryParamsRuntime';

describe('sharedQueryParamsRuntime', () => {
  it('builds a runtime definition seeded with the shared query params logic and state', () => {
    const info = sharedQueryParamsRuntime('test');

    expect(info.api).toBe(sharedQueryParamsLogic);
    expect(info.initialState).toBe(sharedQueryParamsInitalState);
  });
});
