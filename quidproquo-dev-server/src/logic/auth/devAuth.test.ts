import { describe, expect, it } from 'vitest';

import { createDevJwt, createDevUserAttributes, createDevUserId, DEV_USER_EMAIL } from './devAuth';

const decodeJwtPayload = (jwt: string): Record<string, any> => JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());

describe('createDevUserId', () => {
  it('returns the same userId for the same email', () => {
    expect(createDevUserId('joe@example.com')).toBe(createDevUserId('joe@example.com'));
  });

  it('is case-insensitive and ignores surrounding whitespace', () => {
    expect(createDevUserId('Joe@Example.com')).toBe(createDevUserId('joe@example.com'));
    expect(createDevUserId(' joe@example.com ')).toBe(createDevUserId('joe@example.com'));
  });

  it('returns different userIds for different emails', () => {
    expect(createDevUserId('joe@example.com')).not.toBe(createDevUserId('jane@example.com'));
  });

  it('returns a v5 UUID', () => {
    expect(createDevUserId('joe@example.com')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('passes an existing userId through instead of re-hashing it', () => {
    const userId = createDevUserId('joe@example.com');

    expect(createDevUserId(userId)).toBe(userId);
  });

  it('falls back to the dev user for a missing username', () => {
    expect(createDevUserId()).toBe(createDevUserId(DEV_USER_EMAIL));
  });
});

describe('createDevJwt', () => {
  it('puts the derived userId in sub and keeps the email in username/email', () => {
    const payload = decodeJwtPayload(createDevJwt('joe@example.com'));

    expect(payload.sub).toBe(createDevUserId('joe@example.com'));
    expect(payload.username).toBe('joe@example.com');
    expect(payload.email).toBe('joe@example.com');
  });

  it('mints the same sub for the same login across tokens', () => {
    expect(decodeJwtPayload(createDevJwt('joe@example.com')).sub).toBe(decodeJwtPayload(createDevJwt('Joe@Example.com')).sub);
  });
});

describe('createDevUserAttributes', () => {
  it('derives the userId from the email', () => {
    expect(createDevUserAttributes('joe@example.com')).toEqual({
      userId: createDevUserId('joe@example.com'),
      email: 'joe@example.com',
      emailVerified: true,
    });
  });

  it('keeps an existing userId and falls back to the dev user email', () => {
    const userId = createDevUserId('joe@example.com');

    expect(createDevUserAttributes(userId)).toEqual({
      userId,
      email: DEV_USER_EMAIL,
      emailVerified: true,
    });
  });
});
