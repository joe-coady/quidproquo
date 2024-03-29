export const coreUserDirectoryActionComponentMap: Record<string, string[]> = {
  ['@quidproquo-core/UserDirectory/RefreshToken']: [
    'askUserDirectoryRefreshToken',
    'userDirectoryName',
    'refreshToken',
  ],
  ['@quidproquo-core/UserDirectory/DecodeAccessToken']: [
    'askUserDirectoryDecodeAccessToken',
    'userDirectoryName',
    'ignoreExpiration',
    'accessToken',
    'serviceOverride',
  ],
};

export default coreUserDirectoryActionComponentMap;
