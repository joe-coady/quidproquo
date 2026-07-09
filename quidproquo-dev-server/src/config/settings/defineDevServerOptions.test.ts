import { buildTestQpqConfig } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { defineDevServerOptions, getDevServerOptions, QPQDevServerConfigSettingType } from './defineDevServerOptions';

describe('defineDevServerOptions', () => {
  it('builds a DevServerOptions setting with the given port', () => {
    expect(defineDevServerOptions({ port: 3069 })).toEqual({
      configSettingType: QPQDevServerConfigSettingType.devServerOptions,
      uniqueKey: 'DevServerOptions',
      port: 3069,
    });
  });
});

describe('getDevServerOptions', () => {
  it('returns the defined options', () => {
    const qpqConfig = buildTestQpqConfig([defineDevServerOptions({ port: 3069 })]);

    expect(getDevServerOptions(qpqConfig).port).toBe(3069);
  });

  it('returns empty options when none are defined', () => {
    expect(getDevServerOptions(buildTestQpqConfig())).toEqual({});
  });

  it('throws when more than one is defined', () => {
    const qpqConfig = buildTestQpqConfig([defineDevServerOptions({ port: 3069 }), defineDevServerOptions({ port: 3070 })]);

    expect(() => getDevServerOptions(qpqConfig)).toThrow();
  });
});
