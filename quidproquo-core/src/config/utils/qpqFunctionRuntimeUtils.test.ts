import { describe, expect, it } from 'vitest';

import { getStoryNameFromQpqFunctionRuntime } from './qpqFunctionRuntimeUtils';

describe('getStoryNameFromQpqFunctionRuntime', () => {
  it('returns the method after the :: separator for a relative path runtime', () => {
    expect(getStoryNameFromQpqFunctionRuntime('/entry/controller::onAuthUpdate')).toBe('onAuthUpdate');
  });

  it('returns the functionName for an advanced runtime', () => {
    expect(getStoryNameFromQpqFunctionRuntime({ basePath: '/repo', relativePath: '/entry', functionName: 'handler' })).toBe('handler');
  });
});
