import { describe, expect, it } from 'vitest';

import { generateUUID } from './uuidUtils';

describe('generateUUID', () => {
  it('produces a v4-shaped uuid', () => {
    expect(generateUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('produces a different value on each call', () => {
    expect(generateUUID()).not.toBe(generateUUID());
  });
});
