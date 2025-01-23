import { AuthenticateUserResponse, AuthenticationInfo } from 'quidproquo-core';

import { apiRequestPost } from '../../logic';

export const refreshTokens = async (authenticationInfo: AuthenticationInfo | undefined, apiBaseUrl: string): Promise<AuthenticateUserResponse> => {
  const refreshTokenPayload = {
    refreshToken: authenticationInfo?.refreshToken,
  };

  const response = await apiRequestPost<AuthenticateUserResponse>('/refreshToken', refreshTokenPayload, apiBaseUrl, authenticationInfo?.accessToken);

  return response;
};
