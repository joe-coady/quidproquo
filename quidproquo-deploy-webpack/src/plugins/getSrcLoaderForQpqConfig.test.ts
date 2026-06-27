import { buildTestQpqConfig, defineInlineFunction } from 'quidproquo-core';

import path from 'path';
import { describe, expect, it } from 'vitest';

import { getFullSrcPathFromQpqFunctionRuntime, getSrcLoaderForQpqConfig } from './getSrcLoaderForQpqConfig';

describe('getFullSrcPathFromQpqFunctionRuntime', () => {
  it('joins the basePath and relativePath for an advanced runtime', () => {
    const runtime = { basePath: '/abs/base', relativePath: 'src/handler.ts', functionName: 'handler' };

    expect(getFullSrcPathFromQpqFunctionRuntime(runtime, buildTestQpqConfig())).toBe(path.join('/abs/base', 'src/handler.ts'));
  });

  it('joins the config root with the src path for a string runtime', () => {
    const config = buildTestQpqConfig([], { configRoot: '/abs/root' });

    expect(getFullSrcPathFromQpqFunctionRuntime('/src/handlers/doThing::handler', config)).toBe(path.join('/abs/root', 'src/handlers/doThing'));
  });
});

describe('getSrcLoaderForQpqConfig', () => {
  it('returns an empty string when the config has no src entries', () => {
    expect(getSrcLoaderForQpqConfig(buildTestQpqConfig(), 'runtime')).toBe('');
  });

  it('generates a guarded require for a string src entry', () => {
    const config = buildTestQpqConfig([defineInlineFunction('/src/handlers/doThing::handler')]);

    const src = getSrcLoaderForQpqConfig(config, 'runtime');

    expect(src).toContain('src/handlers/doThing');
    expect(src).toContain("module['handler']");
  });

  it('compares basePath, relativePath and functionName for an advanced src entry', () => {
    const config = buildTestQpqConfig([
      defineInlineFunction({ basePath: '/abs/base', relativePath: 'src/handler.ts', functionName: 'handler' }),
    ]);

    const src = getSrcLoaderForQpqConfig(config, 'runtime');

    expect(src).toContain('runtime.basePath === String.raw`/abs/base`');
    expect(src).toContain('runtime.relativePath === String.raw`src/handler.ts`');
    expect(src).toContain('runtime.functionName === String.raw`handler`');
  });
});
