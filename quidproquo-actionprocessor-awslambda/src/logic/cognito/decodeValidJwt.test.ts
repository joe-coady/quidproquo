import { describe, expect, it } from 'vitest';

import { decodeValidJwt } from './decodeValidJwt';

describe('decodeValidJwt', () => {
  it('returns null when no access token is provided', async () => {
    expect(await decodeValidJwt('pool', 'us-east-1', false)).toBeNull();
  });

  it('returns null when the token cannot be decoded', async () => {
    expect(await decodeValidJwt('pool', 'us-east-1', false, 'not-a-jwt')).toBeNull();
  });
});
