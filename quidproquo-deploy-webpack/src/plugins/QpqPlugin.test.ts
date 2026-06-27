import { buildTestQpqConfig } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { QpqPlugin } from './QpqPlugin';

describe('QpqPlugin', () => {
  it('constructs a webpack plugin instance exposing apply', () => {
    const plugin = new QpqPlugin({ qpqConfigs: [buildTestQpqConfig()], nodeModulePath: 'node_modules' });

    expect(plugin).toBeInstanceOf(QpqPlugin);
    expect(typeof plugin.apply).toBe('function');
  });
});
