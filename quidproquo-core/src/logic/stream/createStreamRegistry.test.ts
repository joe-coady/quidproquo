import { describe, expect, it } from 'vitest';

import { createStreamRegistry } from './createStreamRegistry';

async function* fromArray(items: string[]): AsyncIterableIterator<string> {
  for (const item of items) {
    yield item;
  }
}

describe('createStreamRegistry', () => {
  it('reads chunks in order then reports done when exhausted', async () => {
    const registry = createStreamRegistry();
    registry.register('s', fromArray(['a', 'b']));

    expect(await registry.read('s')).toEqual({ done: false, data: 'a' });
    expect(await registry.read('s')).toEqual({ done: false, data: 'b' });
    expect(await registry.read('s')).toEqual({ done: true });
  });

  it('throws when registering the same id twice', () => {
    const registry = createStreamRegistry();
    registry.register('dup', fromArray(['x']));

    expect(() => registry.register('dup', fromArray(['y']))).toThrow('Stream already registered: dup');
  });

  it('throws when reading a missing id', async () => {
    const registry = createStreamRegistry();

    await expect(registry.read('nope')).rejects.toThrow('Stream not found: nope');
  });

  it('reflects registration via has and clears it on close', () => {
    const registry = createStreamRegistry();
    expect(registry.has('s')).toBe(false);

    registry.register('s', fromArray(['a']));
    expect(registry.has('s')).toBe(true);

    registry.close('s');
    expect(registry.has('s')).toBe(false);
  });

  it('marks the stream done after exhaustion clears it from the registry', async () => {
    const registry = createStreamRegistry();
    registry.register('s', fromArray(['only']));

    await registry.read('s');
    expect(await registry.read('s')).toEqual({ done: true });
    expect(registry.has('s')).toBe(false);
  });

  it('skips with noWait when the next chunk is not ready, then returns it once it is', async () => {
    let release!: (value: string) => void;
    const gate = new Promise<string>((resolve) => {
      release = resolve;
    });

    async function* gated(): AsyncIterableIterator<string> {
      yield await gate;
      yield 'second';
    }

    const registry = createStreamRegistry();
    registry.register('g', gated());

    expect(await registry.read('g', true)).toEqual({ done: false, skipped: true });

    release('first');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(await registry.read('g', true)).toEqual({ done: false, data: 'first' });
  });
});
