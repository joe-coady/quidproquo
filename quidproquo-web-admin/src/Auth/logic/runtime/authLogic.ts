import { askAuthUISetPassword, askAuthUISetUsername } from '../authActionCreator';
import { askAuthLogin } from './askAuthLogin';

export const authLogic = {
  askAuthLogin,

  askAuthUISetUsername,
  askAuthUISetPassword,
};
