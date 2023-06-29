import { AuthenticateUserChallenge } from './types';

export enum UserDirectoryActionType {
  CreateUser = '@quidproquo-core/UserDirectory/CreateUser',
  AuthenticateUser = '@quidproquo-core/UserDirectory/AuthenticateUser',
  ForgotPassword = '@quidproquo-core/UserDirectory/ForgotPassword',
  ConfirmForgotPassword = '@quidproquo-core/UserDirectory/ConfirmForgotPassword',
  RefreshToken = '@quidproquo-core/UserDirectory/RefreshToken',
  RequestEmailVerification = '@quidproquo-core/UserDirectory/RequestEmailVerification',
  ConfirmEmailVerification = '@quidproquo-core/UserDirectory/ConfirmEmailVerification',
  ReadAccessToken = '@quidproquo-core/UserDirectory/ReadAccessToken',
  DecodeAccessToken = '@quidproquo-core/UserDirectory/DecodeAccessToken',
  RespondToAuthChallenge = '@quidproquo-core/UserDirectory/RespondToAuthChallenge',
  GetUserAttributes = '@quidproquo-core/UserDirectory/GetUserAttributes',
  SetUserAttributes = '@quidproquo-core/UserDirectory/SetUserAttributes',
}

export interface AuthenticationInfo {
  accessToken?: string;
  expirationDurationInSeconds?: number;
  expiresAt?: string;
  idToken?: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface AuthenticationDeliveryDetails {
  attributeName: string;
  deliveryMedium: 'EMAIL' | 'SMS';
  destination: string;
}

export interface AuthenticateUserResponse {
  challenge: AuthenticateUserChallenge;

  authenticationInfo?: AuthenticationInfo;
  session?: string;
}

export interface DecodedAccessToken {
  userId: string;
  username: string;
}

export interface UserAttributes {
  /** The user's email address */
  email?: string;
  /** Indicates whether the user's email address has been verified */
  emailVerified?: boolean;
  /** The user's unique identifier */
  userId?: string;
  /** The user's postal address */
  address?: string;
  /** The user's date of birth (YYYY-MM-DD format) */
  birthDate?: string;
  /** The user's last name or surname */
  familyName?: string;
  /** The user's gender (e.g., "male", "female", "other") */
  gender?: string;
  /** The user's first name or given name */
  givenName?: string;
  /** The user's preferred locale (e.g., "en-US", "fr-FR") */
  locale?: string;
  /** The user's middle name */
  middleName?: string;
  /** The user's full name */
  name?: string;
  /** The user's nickname or alias */
  nickname?: string;
  /** The user's phone number (in E.164 format, e.g., "+1-555-123-4567") */
  phoneNumber?: string;
  /** The URL of the user's profile picture */
  picture?: string;
  /** The user's preferred username, if different from the given name */
  preferredUsername?: string;
  /** The URL of the user's profile page */
  profile?: string;
  /** The URL of the user's personal website or blog */
  website?: string;
  /** The user's timezone (e.g., "America/Los_Angeles", "Europe/London") */
  zoneInfo?: string;
}
