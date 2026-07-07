import { buildTestQpqConfig } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getQpqDyanmicLoaderSrcFromQpqConfigs } from './getQpqDyanmicLoaderSrcFromQpqConfigs';

describe('getQpqDyanmicLoaderSrcFromQpqConfigs', () => {
  it('returns an empty-loader module when no configs are provided', () => {
    const src = getQpqDyanmicLoaderSrcFromQpqConfigs([]);

    expect(src).toContain('qpqConfig = undefined');
    expect(src).toContain('qpqConfigs = []');
  });

  it('returns an empty-loader module when configs is undefined', () => {
    const src = getQpqDyanmicLoaderSrcFromQpqConfigs(undefined);

    expect(src).toContain('qpqConfigs = []');
  });

  it('embeds the serialised configs and both loader functions', () => {
    const src = getQpqDyanmicLoaderSrcFromQpqConfigs([buildTestQpqConfig()]);

    expect(src).toContain('test-app');
    expect(src).toContain('qpqDynamicModuleLoader');
    expect(src).toContain('qpqDynamicModuleLoaderForService');
  });
});
