import { describe, expect, it } from 'vitest';

import { lastEvaluatedKeyToString } from '../logs';
import { itemsToQpqPagedData as qpqPagedDataToItems } from './qpqPagedDataToItems';

describe('qpqPagedDataToItems', () => {
  it('decodes the page key back into a last evaluated key', () => {
    const lastEvaluatedKey = { pk: { S: 'a' } };

    expect(qpqPagedDataToItems([1, 2], lastEvaluatedKeyToString(lastEvaluatedKey))).toEqual({
      items: [1, 2],
      lastEvaluatedKey,
    });
  });

  it('leaves lastEvaluatedKey falsy when no page key is given', () => {
    expect(qpqPagedDataToItems(['a'])).toEqual({ items: ['a'], lastEvaluatedKey: undefined });
  });
});
