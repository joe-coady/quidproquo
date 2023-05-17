export enum AuthenticateUserChallenge {
  NONE = 'NONE',
  NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',

  // Im not sure if this is a challenge or not ~ I feel like its not
  // we will never challenge the user after an email has been sent to them... soo yeah
  RESET_PASSWORD = 'RESET_PASSWORD',
}
