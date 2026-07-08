import { buildTestQpqConfig } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getAllRspackConfig, getRspackConfig } from './getRspackConfigForQpq';
import { QpqPlugin } from './plugins';

describe('getRspackConfig', () => {
  const entries = { handler: './src/handler.ts' };

  it('returns the entries, node target and commonjs output', () => {
    const config = getRspackConfig(buildTestQpqConfig(), 'out', entries, 'node_modules');

    expect(config.entry).toEqual(entries);
    expect(config.target).toBe('node');
    expect(config.output?.path).toBe('out');
    expect(config.output?.filename).toBe('[name]/index.js');
    expect(config.output?.library).toEqual({ type: 'commonjs2' });
  });

  it('uses the configured environment as the build mode when it is an rspack mode', () => {
    const config = getRspackConfig(buildTestQpqConfig([], { environment: 'development' }), 'out', entries, 'node_modules');

    expect(config.mode).toBe('development');
  });

  it('defaults the build mode to production for non-rspack environments', () => {
    const config = getRspackConfig(buildTestQpqConfig([], { environment: 'staging' }), 'out', entries, 'node_modules');

    expect(config.mode).toBe('production');
  });

  it('registers a QpqPlugin for the config', () => {
    const config = getRspackConfig(buildTestQpqConfig(), 'out', entries, 'node_modules');

    expect(config.plugins?.[0]).toBeInstanceOf(QpqPlugin);
  });
});

describe('getAllRspackConfig', () => {
  const entries = { handler: './src/handler.ts' };

  it('passes through the provided output and node module paths', () => {
    const config = getAllRspackConfig(buildTestQpqConfig(), entries, 'dist', 'vendor');

    expect(config.output?.path).toBe('dist');
  });

  it('defaults the output path to build when omitted', () => {
    const config = getAllRspackConfig(buildTestQpqConfig(), entries);

    expect(config.output?.path).toBe('build');
  });
});
