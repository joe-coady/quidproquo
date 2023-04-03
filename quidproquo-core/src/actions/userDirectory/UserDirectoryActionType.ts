export enum UserDirectoryActionType {
  CreateUser = '@quidproquo-core/UserDirectory/CreateUser',
  AuthenticateUser = '@quidproquo-core/UserDirectory/AuthenticateUser',
}

export enum AuthenticateUserChallenge {
  NONE = 'NONE',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export interface AuthenticationInfo {
  accessToken?: string;
  expiresIn?: number;
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
