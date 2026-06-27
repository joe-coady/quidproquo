import { describe, expect, it } from 'vitest';

import { verifyJwt } from './verifyJwt';

describe('verifyJwt', () => {
  it('returns false when the token cannot be decoded', async () => {
    expect(await verifyJwt('not-a-jwt', 'pool', 'us-east-1')).toBe(false);
  });
});
