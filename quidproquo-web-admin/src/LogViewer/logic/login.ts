import { AuthenticateUserResponse } from "quidproquo-core";

import { apiRequestPost } from '../../logic';

export const login = async (
  username: string,
  password: string,
): Promise<AuthenticateUserResponse> => {
  const loginPayload = {
    username,
    password,
  };

  const response = await apiRequestPost<AuthenticateUserResponse>('/login', loginPayload);

  return response;
};
