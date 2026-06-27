import { describe, expect, it } from 'vitest';

import { sortPathMatchConfigs, urlPathLength } from './pathUtils';

describe('urlPathLength', () => {
  it.each([
    ['a static path', '/users/list', 11],
    ['a single param', '/users/{id}', 7],
    ['multiple params', '/users/{id}/posts/{postId}', 14],
  ])('measures %s ignoring param placeholders', (_label: string, path: string, expected: number) => {
    expect(urlPathLength(path)).toBe(expected);
  });
});

describe('sortPathMatchConfigs', () => {
  it('orders configs by their param-stripped length, ascending', () => {
    const configs = [{ path: '/users/{id}/posts' }, { path: '/a' }, { path: '/users' }];

    expect(sortPathMatchConfigs(configs).map((c) => c.path)).toEqual(['/a', '/users', '/users/{id}/posts']);
  });

  it('does not mutate the input array', () => {
    const configs = [{ path: '/bbb' }, { path: '/a' }];
    sortPathMatchConfigs(configs);

    expect(configs.map((c) => c.path)).toEqual(['/bbb', '/a']);
  });
});
