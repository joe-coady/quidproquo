import { buildTestQpqConfig, InlineFunctionActionType, StreamActionType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getCoreActionProcessor } from './index';

describe('getCoreActionProcessor', () => {
  it('merges the js core processors with the node-specific stream and inline processors', async () => {
    const processors = await getCoreActionProcessor(buildTestQpqConfig(), async () => null);

    const keys = Object.keys(processors);
    expect(keys).toContain(StreamActionType.Read);
    expect(keys).toContain(StreamActionType.Close);
    expect(keys).toContain(InlineFunctionActionType.Execute);
    expect(keys.length).toBeGreaterThan(3);
  });
});
