import { buildTestQpqConfig, defineParameter } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { resolveParameterKey, resolveResourceName, resolveSecretKey } from './qpqAwsLambdaRuntimeConfigUtils';

describe('resolveResourceName', () => {
  it('builds the runtime resource name from the config', () => {
    expect(resolveResourceName('queue', buildTestQpqConfig())).toBe('queue-test-app-test-module-development');
  });
});

describe('resolveSecretKey', () => {
  it('builds the runtime secret key from the config', () => {
    expect(resolveSecretKey('apiKey', buildTestQpqConfig())).toBe('apiKey-test-app-test-module-development');
  });
});

describe('resolveParameterKey', () => {
  it('builds the runtime parameter key from the config', () => {
    const config = buildTestQpqConfig([defineParameter('flag')]);

    expect(resolveParameterKey('flag', config)).toBe('flag-test-app-test-module-development');
  });
});
