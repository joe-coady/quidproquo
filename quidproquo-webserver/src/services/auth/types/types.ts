export type LoginPayload = {
  username: string;
  password: string;
};

export type RefreshPayload = {
  refreshToken: string;
};

export type ChallengePayload = {
  email: string;
  session: string;
  challenge: string;
};

export type NewPasswordChallengePayload = ChallengePayload & {
  newPassword: string;
};

export type ForgotPasswordPayload = {
  username: string;
};

export type ConfirmForgotPasswordPayload = {
  username: string;
  code: string;
  password: string;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};
