import { describe, expect, it } from 'vitest';

import { generateUuid } from './generateUuid';

describe('generateUuid', () => {
  it('returns a string', () => {
    expect(typeof generateUuid()).toBe('string');
  });

  it('is exactly 36 characters long', () => {
    expect(generateUuid()).toHaveLength(36);
  });

  it('contains exactly 4 dashes', () => {
    const dashes = generateUuid()
      .split('')
      .filter((c) => c === '-').length;

    expect(dashes).toBe(4);
  });

  it('has dashes in the 8-4-4-4-12 positions', () => {
    const uuid = generateUuid();

    expect(uuid[8]).toBe('-');
    expect(uuid[13]).toBe('-');
    expect(uuid[18]).toBe('-');
    expect(uuid[23]).toBe('-');
  });

  it('splits into 5 groups of the correct lengths', () => {
    const groups = generateUuid().split('-');

    expect(groups.map((g) => g.length)).toEqual([8, 4, 4, 4, 12]);
  });

  it('only contains lowercase hex characters and dashes', () => {
    expect(generateUuid()).toMatch(/^[0-9a-f-]+$/);
  });

  it('contains no uppercase characters', () => {
    const uuid = generateUuid();

    expect(uuid).toBe(uuid.toLowerCase());
  });

  it('sets the version nibble to 4 (the 15th character)', () => {
    // RFC 4122: the first character of the 3rd group encodes the version.
    expect(generateUuid()[14]).toBe('4');
  });

  it('sets the variant nibble to one of 8, 9, a or b (the 20th character)', () => {
    // RFC 4122: the first character of the 4th group encodes the variant.
    expect(generateUuid()[19]).toMatch(/^[89ab]$/);
  });

  it('matches the canonical v4 UUID regex', () => {
    expect(generateUuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('produces a different value on each call', () => {
    expect(generateUuid()).not.toBe(generateUuid());
  });

  it('generates 10,000 unique values with no collisions', () => {
    const count = 10_000;
    const generated = new Set<string>();

    for (let i = 0; i < count; i++) {
      generated.add(generateUuid());
    }

    expect(generated.size).toBe(count);
  });

  it('produces a valid v4 UUID on every one of many iterations', () => {
    const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    for (let i = 0; i < 1_000; i++) {
      expect(generateUuid()).toMatch(v4Regex);
    }
  });
});
