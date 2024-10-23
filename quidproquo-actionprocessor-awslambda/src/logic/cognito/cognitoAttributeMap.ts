import { CreateUserRequest,UserAttributes } from 'quidproquo-core';

export const cognitoAttributeMap: Record<keyof UserAttributes, string> = {
  email: 'email',
  emailVerified: 'email_verified',
  userId: 'sub',

  address: 'address',
  birthDate: 'birthdate',
  familyName: 'family_name',
  gender: 'gender',
  givenName: 'given_name',
  locale: 'locale',
  middleName: 'middle_name',
  name: 'name',
  nickname: 'nickname',
  phoneNumber: 'phone_number',
  picture: 'picture',
  preferredUsername: 'preferred_username',
  profile: 'profile',
  website: 'website',
  zoneInfo: 'zoneinfo',
};

// Flip the cognitoAttributeMap for reverse mapping
const reversedCognitoAttributeMap: Record<string, keyof UserAttributes> = Object.entries(cognitoAttributeMap).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {},
);

export const getCognitoUserAttributesFromQpqUserAttributes = (userAttributes: UserAttributes) => {
  return Object.keys(userAttributes)
    .map((key) => ({
      Name: cognitoAttributeMap[key as keyof UserAttributes],
      Value: `${userAttributes[key as keyof UserAttributes]}`,
    }))
    .filter((attribute) => !!attribute.Name && !!attribute.Value);
};

const getQpqAttributeObjectFromCognitoKeyValue = (key: string, value: string): UserAttributes => {
  const userAttributeKey = reversedCognitoAttributeMap[key];

  if (!userAttributeKey) {
    return {}; // If there's no matching key in your mapping, just return nothing
  }

  if (userAttributeKey === 'emailVerified') {
    // Assume the value of 'email_verified' is a string of 'true' or 'false'
    return { [userAttributeKey]: value === 'true' };
  }

  return { [userAttributeKey]: value };
};

export const getQpqAttributesFromCognitoUserAttributes = (cognitoUserAttributes: { Name: string; Value: string }[]): UserAttributes => {
  // Map cognitoUserAttributes to your UserAttributes format
  const userAttributes: UserAttributes = cognitoUserAttributes.reduce((acc, { Name, Value }) => {
    return {
      ...acc,
      ...getQpqAttributeObjectFromCognitoKeyValue(Name, Value),
    };
  }, {} as UserAttributes);

  return userAttributes;
};

export const getQpqAttributesFromCognitoStringMap = (cognitoUserAttributes: Record<string, string>): UserAttributes => {
  const userAttributes = Object.keys(cognitoUserAttributes).reduce(
    (acc, key) => ({
      ...acc,
      ...getQpqAttributeObjectFromCognitoKeyValue(key, cognitoUserAttributes[key]),
    }),
    {} as UserAttributes,
  );

  return userAttributes;
};
