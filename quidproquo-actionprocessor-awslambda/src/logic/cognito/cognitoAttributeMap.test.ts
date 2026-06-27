import { describe, expect, it } from 'vitest';

import {
  getCognitoUserAttributesFromQpqUserAttributes,
  getQpqAttributesFromCognitoStringMap,
  getQpqAttributesFromCognitoUserAttributes,
} from './cognitoAttributeMap';

describe('getCognitoUserAttributesFromQpqUserAttributes', () => {
  it('maps qpq attribute keys to their cognito names', () => {
    expect(getCognitoUserAttributesFromQpqUserAttributes({ email: 'a@b.com', givenName: 'Ada' })).toEqual([
      { Name: 'email', Value: 'a@b.com' },
      { Name: 'given_name', Value: 'Ada' },
    ]);
  });

  it('stringifies values, including booleans', () => {
    expect(getCognitoUserAttributesFromQpqUserAttributes({ emailVerified: true })).toEqual([{ Name: 'email_verified', Value: 'true' }]);
  });
});

describe('getQpqAttributesFromCognitoUserAttributes', () => {
  it('reverse maps cognito names to qpq keys', () => {
    expect(
      getQpqAttributesFromCognitoUserAttributes([
        { Name: 'email', Value: 'a@b.com' },
        { Name: 'given_name', Value: 'Ada' },
      ]),
    ).toEqual({ email: 'a@b.com', givenName: 'Ada' });
  });

  it('coerces email_verified to a boolean', () => {
    expect(getQpqAttributesFromCognitoUserAttributes([{ Name: 'email_verified', Value: 'true' }])).toEqual({ emailVerified: true });
    expect(getQpqAttributesFromCognitoUserAttributes([{ Name: 'email_verified', Value: 'false' }])).toEqual({ emailVerified: false });
  });

  it('ignores attributes with no matching mapping', () => {
    expect(getQpqAttributesFromCognitoUserAttributes([{ Name: 'cognito:groups', Value: 'admin' }])).toEqual({});
  });
});

describe('getQpqAttributesFromCognitoStringMap', () => {
  it('maps a record of cognito names to qpq attributes', () => {
    expect(getQpqAttributesFromCognitoStringMap({ sub: 'abc', email_verified: 'false' })).toEqual({
      userId: 'abc',
      emailVerified: false,
    });
  });
});
