import { describe, expect, it } from 'vitest';

import { DecomposedString } from '../../types';
import { decomposedStringToString } from './decomposedStringToString';

describe('decomposedStringToString', () => {
  it('interleaves literal segments with stringified values', () => {
    const decomposed: DecomposedString = [
      ['Hello ', ', you are ', '!'],
      ['Alice', 42],
    ];

    expect(decomposedStringToString(decomposed)).toBe('Hello Alice, you are 42!');
  });

  it('returns the single literal when there are no values', () => {
    expect(decomposedStringToString([['just text'], []])).toBe('just text');
  });

  it('applies a custom value resolver', () => {
    const decomposed: DecomposedString = [['<', '>'], ['x']];

    expect(decomposedStringToString(decomposed, (v) => `[${String(v)}]`)).toBe('<[x]>');
  });
});
