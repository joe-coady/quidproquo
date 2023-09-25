import { AuthenticateUserResponse } from "quidproquo-core";

import { apiRequestPost } from '../../logic';
import { AuthState } from "../../types";

export const refreshTokens = async (
  authState: AuthState,
): Promise<AuthenticateUserResponse> => {
  const refreshTokenPayload = {
    refreshToken: authState.authenticationInfo?.refreshToken
  };

  const response = await apiRequestPost<AuthenticateUserResponse>('/refreshToken', refreshTokenPayload, authState.authenticationInfo?.accessToken);

  return response;
};
