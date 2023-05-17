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
  RespondToAuthChallenge = '@quidproquo-core/UserDirectory/RespondToAuthChallenge',
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
