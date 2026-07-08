import { buildTestQpqConfig } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getAllWebpackConfig, getWebpackConfig } from './getWebpackConfigForQpq';
import { QpqPlugin } from './plugins';

describe('getWebpackConfig', () => {
  const entries = { handler: './src/handler.ts' };

  it('returns the entries, node target and commonjs output', () => {
    const config = getWebpackConfig(buildTestQpqConfig(), 'out', entries, 'node_modules');

    expect(config.entry).toEqual(entries);
    expect(config.target).toBe('node');
    expect(config.output?.path).toBe('out');
    expect(config.output?.filename).toBe('[name]/index.js');
    expect(config.output?.libraryTarget).toBe('commonjs2');
  });

  it('uses the configured environment as the build mode when it is a webpack mode', () => {
    const config = getWebpackConfig(buildTestQpqConfig([], { environment: 'development' }), 'out', entries, 'node_modules');

    expect(config.mode).toBe('development');
  });

  it('defaults the build mode to production for non-webpack environments', () => {
    const config = getWebpackConfig(buildTestQpqConfig([], { environment: 'staging' }), 'out', entries, 'node_modules');

    expect(config.mode).toBe('production');
  });

  it('registers a QpqPlugin for the config', () => {
    const config = getWebpackConfig(buildTestQpqConfig(), 'out', entries, 'node_modules');

    expect(config.plugins?.[0]).toBeInstanceOf(QpqPlugin);
  });
});

describe('getAllWebpackConfig', () => {
  const entries = { handler: './src/handler.ts' };

  it('passes through the provided output and node module paths', () => {
    const config = getAllWebpackConfig(buildTestQpqConfig(), entries, 'dist', 'vendor');

    expect(config.output?.path).toBe('dist');
  });

  it('defaults the output path to build when omitted', () => {
    const config = getAllWebpackConfig(buildTestQpqConfig(), entries);

    expect(config.output?.path).toBe('build');
  });
});
