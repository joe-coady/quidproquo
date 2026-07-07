import { buildTestQpqConfig, defineGlobal } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getDevConfigs } from './main';

describe('getDevConfigs', () => {
  it('returns the base configs unchanged when no overrides are given', () => {
    const config = buildTestQpqConfig();

    const [result] = getDevConfigs([config]);

    expect(result).toEqual(config);
  });

  it('appends all-service overrides to every config', () => {
    const override = defineGlobal('region', 'us-east-1');

    const [result] = getDevConfigs([buildTestQpqConfig()], { allServices: [override] });

    expect(result).toContainEqual(override);
  });

  it('appends service-specific overrides only to the matching module', () => {
    const override = defineGlobal('region', 'eu-west-1');
    const configA = buildTestQpqConfig([], { moduleName: 'svc-a' });
    const configB = buildTestQpqConfig([], { moduleName: 'svc-b' });

    const [resultA, resultB] = getDevConfigs([configA, configB], { byService: { 'svc-a': [override] } });

    expect(resultA).toContainEqual(override);
    expect(resultB).not.toContainEqual(override);
  });
});
