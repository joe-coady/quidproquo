import { AuthenticateUserResponse } from "quidproquo-core";

import { apiRequestPost } from '../../logic';

export const respondToAuthChallenge = async (
  email: string,
  session: string,
  challenge: string,
  newPassword: string
): Promise<AuthenticateUserResponse> => {
  const challengePayload = {
    email,
    session,
    challenge,
    newPassword,
  };

  const response = await apiRequestPost<AuthenticateUserResponse>('/challenge', challengePayload);

  return response;
};
