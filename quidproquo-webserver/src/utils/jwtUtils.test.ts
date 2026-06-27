import { describe, expect, it, vi } from 'vitest';

import { unsafeDecodeJWTPayload } from './jwtUtils';

const encode = (payload: object): string => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${body}.signature`;
};

describe('unsafeDecodeJWTPayload', () => {
  it('decodes the payload segment of a JWT', () => {
    expect(unsafeDecodeJWTPayload(encode({ sub: 'user-1', exp: 123 }))).toEqual({ sub: 'user-1', exp: 123 });
  });

  it('returns null and logs for a malformed token', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(unsafeDecodeJWTPayload('not-a-jwt')).toBeNull();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
