const coreUserDirectoryActionComponentMap: Record<string, string[]> = {
  ['@quidproquo-core/UserDirectory/AuthenticateUser']: ['askUserDirectoryAuthenticateUser', 'userDirectoryName', 'authenticateUserRequest'],
  ['@quidproquo-core/UserDirectory/ForgotPassword']: ['askUserDirectoryForgotPassword', 'userDirectoryName', 'username'],
  ['@quidproquo-core/UserDirectory/ConfirmForgotPassword']: [
    'askUserDirectoryConfirmForgotPassword',
    'userDirectoryName',
    'code',
    'username',
    'password',
  ],
  ['@quidproquo-core/UserDirectory/CreateUser']: ['askUserDirectoryCreateUser', 'userDirectoryName', 'createUserRequest'],
  ['@quidproquo-core/UserDirectory/RequestEmailVerification']: ['askUserDirectoryRequestEmailVerification', 'userDirectoryName', 'accessToken'],
  ['@quidproquo-core/UserDirectory/ConfirmEmailVerification']: ['askUserDirectoryConfirmEmailVerification', 'code', 'accessToken'],
  ['@quidproquo-core/UserDirectory/ReadAccessToken']: ['askUserDirectoryReadAccessToken', 'userDirectoryName', 'ignoreExpiration', 'serviceOverride'],
  ['@quidproquo-core/UserDirectory/SetAccessToken']: ['askUserDirectorySetAccessToken', 'accessToken'],
  ['@quidproquo-core/UserDirectory/DecodeAccessToken']: [
    'askUserDirectoryDecodeAccessToken',
    'userDirectoryName',
    'ignoreExpiration',
    'accessToken',
    'serviceOverride',
  ],
  ['@quidproquo-core/UserDirectory/RespondToAuthChallenge']: ['askUserDirectoryRespondToAuthChallenge', 'userDirectoryName', 'authChallenge'],
  ['@quidproquo-core/UserDirectory/GetUserAttributes']: ['askUserDirectoryGetUserAttributes', 'userDirectoryName', 'username', 'serviceOverride'],
  ['@quidproquo-core/UserDirectory/GetUserAttributesByUserId']: [
    'askUserDirectoryGetUserAttributesByUserId',
    'userDirectoryName',
    'userId',
    'serviceOverride',
  ],
  ['@quidproquo-core/UserDirectory/SetUserAttributes']: [
    'askUserDirectorySetUserAttributes',
    'userDirectoryName',
    'username',
    'userAttributes',
    'serviceOverride',
  ],
  ['@quidproquo-core/UserDirectory/ChangePassword']: ['askUserDirectoryChangePassword', 'oldPassword', 'newPassword'],
  ['@quidproquo-core/UserDirectory/SetPassword']: ['askUserDirectorySetPassword', 'userDirectoryName', 'username', 'newPassword'],
  ['@quidproquo-core/UserDirectory/GetUsers']: ['askUserDirectoryGetUsers', 'userDirectoryName', 'nextPageKey', 'serviceOverride'],
  ['@quidproquo-core/UserDirectory/RefreshToken']: ['askUserDirectoryRefreshToken', 'userDirectoryName', 'refreshToken'],
};

export default coreUserDirectoryActionComponentMap;
