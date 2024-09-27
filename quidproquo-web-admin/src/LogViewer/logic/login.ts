import { AuthenticateUserResponse } from 'quidproquo-core';

import { apiRequestPost } from '../../logic';

export const login = async (username: string, password: string, apiBaseUrl: string): Promise<AuthenticateUserResponse> => {
  const loginPayload = {
    username,
    password,
  };

  const response = await apiRequestPost<AuthenticateUserResponse>('/login', loginPayload, apiBaseUrl);

  return response;
};
